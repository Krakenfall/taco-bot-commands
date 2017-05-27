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

var searchByName = function(name, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].name === name) {
			return array[i]
		}
	}
};

var processCommand = function(inputCommand, commands, post) {
	var result = searchByName(inputCommand.toLowerCase(), commands);
	if (result) {
		var reply;
		if (result.selectRandom) {
			reply = pickRandom(result);
		} else {
			reply = result.value[0];
		}
		if (reply) {
			apputil.groupme_text_post(reply, post.group_id, function(e, r){
				if (!e) {
					apputil.log(r);
				} else {
					apputil.log(e);
				}
			});
		} else {
			apputil.log(`Failed to select a reply to command ${inputCommand.toLowerCase()}`);
		}
	} else {
		apputil.log(`Command from ${post.name} (ID: ${post.sender_id}) not found: ${inputCommand.toLowerCase()}`);
	}
};

// Check for known ignored accounts (bots, kuranden, etc)
// TODO: Move some of this into configuration maybe?
var isIgnoredAccount = function(groupmePost) {
	var senderId = groupmePost.sender_id;
	var senderType = groupmePost.sender_type;

	return senderId === "329044"
		|| senderId === "329214"
		|| senderId === "356826"
		|| senderType === "bot" // ignore all bot posts, we may want to relax this restriction in the future
}

module.exports = {

	investigate: function(groupmePost) {
		if (isIgnoredAccount(groupmePost))
		{
			// if the account is an ignored account don't do anything more with the
			// post
			return;
		}

		// find commands in the text of the groupme message and process them
		parseMessage(groupmePost.text, function(err, inputCommands) {			
			db.get().collection("commands").find().toArray(function(error, commands) {
				if (error) {
					apputil.log(`Error retrieving commands: ${error}`);
				} else {
					for (var i = 0; i < inputCommands.length; i++) {
						processCommand(inputCommands[i], commands, groupmePost);
					}
				}
			});
		});
	}
};
