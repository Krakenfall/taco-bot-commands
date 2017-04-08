// Third-party dependencies
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var express = require('express');
var bodyParser = require('body-parser');

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
	res.redirect(`http://${config.domain}`);
});

// Return log, should this be an admin call?
app.get('/log', function(req, res) {
	var logName = "server.log";
	util.readFile(logName, function(error, logData){
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
			res.send(JSON.stringify(results));
		}
	});	
});

// Receive messages from groupme bot api
app.post("/command", function(req, res) {
	res.writeHead(200);
	res.end(commandsController.investigate(req.body));
});

// Handle Error response
app.use(function(err, req, res, next) {
	apputil.log(`Error with server:\r\nError:\r\n ${err.stack} \r\nStack: ${err.stack}`);
	res.status(500).send('Something broke!');
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
});