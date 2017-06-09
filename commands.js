var fs = require('fs');
var http = require('http');
var request = require('request');
var destinyCmds = require('./bungieApiCommands.js');
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

var parseUtilityCommands = function(command, message) {
	return message.replace(`!${command} `, '');
};

var pickRandom = function(cmdObject) {
	var rnged = apputil.shuffle(cmdObject.value);
	return rnged[0];
}

var processCommands = function(inputCommands, commands, text, callback) {
	if (inputCommands) {
		// If command needs arguments, it must be the first thing in the comment
		if (inputCommands.length == 1 && 
			text.indexOf('!') == 0 &&
			commands.find(o => o.name === inputCommands[0].toLowerCase()).requiresArgs) {

			var result = commands.find(o => o.name === inputCommands[0].toLowerCase());
			var arg = parseUtilityCommands(inputCommands[0], text);
			switch(result.name) {
				case "grimoirescore" :
					destinyCmds.grimoireScore('1', arg, function(err, reply){
						if (err) { apputil.log(`Error getting grimoirescore: ${err}`); callback(null, [result.value[0]]); }
						else { callback(null, [reply]); }
					});
					break;
				case "grimoirescorepsn" :
					destinyCmds.grimoireScore('2', arg, function(err, reply){
						if (err) { apputil.log(`Error getting grimoirescorepsn: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "playtime" :
					destinyCmds.playTime('1', arg, function(err, reply){
						if (err) { apputil.log(`Error getting playtime: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "playtimepsn" :
					destinyCmds.playTime('2', arg, function(err, reply){
						if (err) { apputil.log(`Error getting playtimepsn: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "pvpsummary" :
					destinyCmds.pvpSummary('1', arg, function(err, reply){
						if (err) { apputil.log(`Error getting pvpsummary: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "pvpsummarypsn" :
					destinyCmds.pvpSummary('2', arg, function(err, reply){
						if (err) { apputil.log(`Error getting pvpsummarypsn: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "pvpkills" :
					destinyCmds.pvpKills('1', arg, function(err, reply){
						if (err) { apputil.log(`Error getting pvpkills: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				case "pvpkillspsn" :
					destinyCmds.pvpKills('2', arg, function(err, reply){
						if (err) { apputil.log(`Error getting pvpkillspsn: ${err}`); callback(null, [result.value]); }
						else { callback(null, [reply]); }
					});
					break;
				default :
					apputil.log(`Command ${result.name} not handled here. Is the requiresArgs setting correct?`);
					break;
			}
		} else {
			var replies = [];
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
			callback(null, replies);
		}	
	}
};

module.exports = {

	investigate: function(text, callback) {
		parseMessage(text, function(err, inputCommands) {			
			db.get().collection("commands").find().toArray(function(error, commands) {
				if (error) {
					apputil.log(`Error retrieving commands: ${error}`);
				} else {
					processCommands(inputCommands, commands, text, function(err, replies){
						callback(err, replies);
					});
				}
			});
		});
	}
};
