var fs = require('fs');
var http = require('http');
var request = require('request');
var apputil = require("./util.js");
var db = require('./db.js');
var Promise = require('bluebird');

var sortObject = function (o) {
    var sorted = {},
    key, a = [];
    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }
    a.sort();
    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
};

// Look for segments of a message that have an exclamation followed by one or
// more alphaneumeric characters
var parseMessage = function(message, callback) {
	var pattern = /\!([a-zA-Z0-9]+)/g;
	var matches = message.match(pattern);

	if (matches) {
		for (var i = 0; i < matches.length; i++) {
			matches[i] = matches[i].replace(/\!/g, '');
		}
	}
	else {
		// if no matches are found, return an empty array
		// this makes it easier for the function's clients to handle because they
		// do not have to worry about nulls.
		callback(null, []);
	}
	callback(null, matches);
};

var pickRandom = function(cmdObject) {
	var rnged = apputil.shuffle(cmdObject.value);
	return rnged[0];
}

var processCommands = function(inputCommands, commands, callback) {
	var replies = [];
	if (inputCommands){
		for (var i = 0; i < inputCommands.length; i++) {
			var result = commands.find(o => o.name === inputCommands[i].toLowerCase());
			if (result) {
				var reply;
				if (result.selectRandom) {
					reply = pickRandom(result);
				} else {
					reply = result.value[0];
				}
				if (reply) {
					replies.push(reply);
				}
			} else {
				apputil.log(`Command not found: ${inputCommands[i].toLowerCase()}`);
			}
		}
	}
	callback(null, replies);
};

module.exports = {

	investigate: function(text, callback) {
		parseMessage(text, function(err, inputCommands) {			
			db.get().collection("commands").find().toArray(function(error, commands) {
				if (error) {
					apputil.log(`Error retrieving commands: ${error}`);
				} else {
					processCommands(inputCommands, commands, function(err, replies){
						callback(err, replies);
					});
				}
			});
		});
	}
};
