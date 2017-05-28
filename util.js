var fs = require('fs');
var http = require('http');
var request = require('request');
var configService = require('./services/configuration.js');
var db = require('./db.js');

var log = function(data, file, logInConsole) {
	var logFile = "";
	if (file) {
		logFile = file;
	} else {
		logFile = "server.log";
	}
	try {
		fs.appendFileSync(logFile, new Date() + "\r\n");
		if (logInConsole) { console.log(data); }
		fs.appendFileSync(logFile, data + "\r\n\r\n");
	} catch (error) {
		console.log("Error: Failed to log data in " + file + "\r\nData: " + data);
	}
};

var getFileContents = function(filename, callback) {
	var contents = null;
	try {
		contents = fs.readFileSync(filename);
		callback(null, contents);
	} catch(err) {
		callback("Error: Could not read file " + filename + "\r\n" + err);
	}
};

// TODO: streamline this out with promises
function announceError(source, message, callback) {
	var logMessage = `${source}:\r\n${message}`;

	log(message);
	callback(logMessage);
}

// Check for known ignored accounts (bots, kuranden, etc)
// TODO: Move some of this into configuration maybe?
var isIgnoredGroupMeAccount = function(groupmePost) {
	var senderId = groupmePost.sender_id;
	var senderType = groupmePost.sender_type;

	return senderId === "329044"
		|| senderId === "329214"
		|| senderId === "356826"
		|| senderType === "bot" // ignore all bot posts, we may want to relax this restriction in the future
}

var groupme_text_post = function(text, groupId, callback) {
	var bot = null;
	db.get().collection("bots").find().toArray(function(error, bots) {
		if (error) {
			log(`Error retrieving bots: ${error}`);
		} else {
			bot = bots.find(o => o.groupId === groupId);
			try {
				var message = "Success! Posted:\r\n";

				request.post("https://api.groupme.com/v3/bots/post"
					, {json: {"bot_id": bot.id, "text": text}}
					, (error, response, body) => {
						if (!error && response.statusCode >= 200 && response.statusCode < 300) {
							message = `${message}${text} Response: \r\n${body}`;
							callback(null, message);
						}
						else {
							message = `Failed to submit GroupMe message.\r\nResponse Code: ${response.statusCode}\r\nError: ${error}\r\nMessage body:\r\n${text}`;
							announceError('groupme_text_post', message, callback);
						}
					}
				);
			}
			catch (err) {
				message = "Error submitting groupme message: " + err;
				log(message);
			}
		}
	});
};

function shuffle(list) {
    for(var j, x, i = list.length; i; j = parseInt(Math.random() * i), x = list[--i], list[i] = list[j], list[j] = x);
    return list;
};

module.exports = {
	readFile: getFileContents,
	isIgnoredGroupMeAccount: isIgnoredGroupMeAccount,
	groupme_text_post: groupme_text_post,
	log: log,
	shuffle: shuffle
};
