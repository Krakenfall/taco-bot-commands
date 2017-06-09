// Third-party dependencies
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var express = require('express');
var bodyParser = require('body-parser');
var Discord = require("discord.js");
var bot = new Discord.Client();

// Local dependencies
var configService = require('./services/configuration.js');
var commandsController = require("./commands.js");
var apputil = require("./util.js");
var db = require('./db.js');

// Retrieve the configuration from file
var configFileName = "config.json";
var config = configService.GetConfigurationSync(configFileName);

// Constants
const app = express();

// Globals

// Install express middleware
app.use(bodyParser.json());

// Handle root
app.get('/', function(req, res) {
	if (config.tacoBotWebUrl) { res.redirect(`${config.tacoBotWebUrl}`); }
	else { res.send("invalid request"); }
});

// Return log, should this be an admin call?
app.get('/log', function(req, res) {
	var logName = "server.log";
	apputil.readFile(logName, function(error, logData){
		if (error) {
			apputil.log(`Error retrieving log: \r\n ${error.stack}`);
			res.end(error);
		} else {
			// fs.readFileSync returns a buffer. Convert to string here
			res.send(logData.toString());
		}
	});
});

// Return api status
app.get('/status', function(req, res) {
	res.send('UP');
});

// Return array of commands
app.get("/commands", function(req, res) {	
	db.get().collection("commands").find().toArray(function(error, results) {
		if (error) {
			apputil.log(`Error retrieving commands: ${error}`);
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.jsonp(results);
		}
	});	
});

// Receive messages from groupme bot api
app.post("/command", function(req, res) {
	res.writeHead(200);
	if (!apputil.isIgnoredGroupMeAccount(req.body))
	{
		commandsController.investigate(req.body.text, function(err, replies){
			if (err) {
				apputil.log(`${err}`);
			} else {
				for(var i = 0; i < replies.length; i++) {
					apputil.groupme_text_post(replies[i], req.body.group_id, function(e, r){
						if (!e) {
							apputil.log(r);
						} else {
							apputil.log(e);
						}
					});
				}
			}		
		});
	}
	res.end();
});

// Handle Error response
app.use(function(err, req, res, next) {
	apputil.log(`Error with server:\r\nError:\r\n ${err.stack} \r\nStack: ${err.stack}`);
	res.status(500).send('Something broke!');
});

bot.on("message", msg => {
	if (msg.author.id != config.discord.ClientId) {
		commandsController.investigate(msg.content, function(err, replies){
			if (err) {
				apputil.log(`${err}`);
			} else {
				for(var i = 0; i < replies.length; i++) {
					msg.channel.sendMessage(replies[i]);
				}
			}
		});
	}
});

db.connect(config.mongoConnectionString, function(err) {
	if (err) {
		apputil.log(`Unable to connect to mongo. Error:\r\n${err}`);
		process.exit(1);
	}
	apputil.log("Opened db connection");

	app.listen(config.port, function () {
		apputil.log("Server listening on port " + config.port, null, true);
	});

	bot.on('ready', () => {
	  apputil.log('Discord bot ready', null, true);
	});
});

bot.login(config.discord.token);