var api = require("./destinyApiWrapper.js");

var getGender = function (character) {
    if (character.characterBase.genderType === 0) {
        return "Male";
    } else {
        return "Female";
    }
};
var timePlayedTotalInHrs = function (characters) {
    var timePlayed = 0;
    for (var i = 0; i < characters.length; i++) {
        timePlayed += parseInt(characters[i].characterBase.minutesPlayedTotal);
    }
    return Math.round(timePlayed / 60);
};

var retrieveAccountSummary = function (membershipType, username, callback) {
    api.getMembershipId(membershipType, username, function(err, id) {
        if (!err) {
            api.getAccountSummary(
                membershipType, username, id, function(err, info) {
                if (!err) {                    
                    callback(null, info.data);
                } else {
                    callback(err);
                }
            });
        }
        else { callback(err); } 
    });
};

var retrieveAccountStats = function (membershipType, username, callback) {
    api.getMembershipId(membershipType, username, function(err, id) {
        if (!err) {
            api.getAccountStats(
                membershipType, id, function(err, info) {
                if (!err) {                    
                    callback(null, info);
                } else {
                    callback(err);
                }
            });
        }
        else { callback(err); } 
    });
};

var retrieveAdvisorData = function (callback) {
    api.getAdvisorData(function(err, advisorData) {
        if (!err) {
            callback(null, advisorData.data);
        }
        else { callback(err); } 
    });
};

var sortCharactersByTimeAscending = function(characters) {
    // Sort by milliseconds time
    return characters.sort(function sortNum (a,b) { 
        return (new Date(a.characterBase.dateLastPlayed)).getTime() - 
        (new Date(b.characterBase.dateLastPlayed)).getTime(); 
    });
};

var sortCharactersByTimeDescending = function(characters) {
    // Sort by milliseconds time
    return characters.sort(function sortNum (a,b) { 
        return (new Date(b.characterBase.dateLastPlayed)).getTime() - 
        (new Date(a.characterBase.dateLastPlayed)).getTime(); 
    });
};

module.exports = {

    nightfall: function(callback) {
        retrieveAdvisorData(function(err, data) {
            if (!err) {
                var nightfall = data.activities.nightfall;
                var response = `NotImplemented`;
                callback(null, response);
            } else { callback(err); }
        });
    },
    grimoireScore : function(membershipType, username, callback) {
        retrieveAccountSummary(membershipType, username, function(err, summary) {
            if (!err) {
                callback(null, `${username}\'s grimoire score is ${summary.grimoireScore}`);
            } else { callback(err); }
        });
    },
    playTime : function(membershipType, username, callback) {
        retrieveAccountSummary(membershipType, username, function(err, summary) {
            if (!err) {
                var platform = "";
                if (membershipType === '1') { platform = "Xbox"; } else { platform = "Playstation"; }
                callback(null, `${username} has played Destiny for ${timePlayedTotalInHrs(summary.characters)} hours on ${platform}`);
            } else { callback(err); }
        });
    },
    pvpSummary : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var response = `Destiny PvP with ${username}:\r\n`;
                var pvpAllTimeStats = stats.mergedAllCharacters.results.allPvP.allTime;
                var pvpPlayTime = pvpAllTimeStats.secondsPlayed.basic.displayValue;
                response = `${response}* PvP play time: ${pvpPlayTime}\r\n`;

                var kills = pvpAllTimeStats.kills.basic.displayValue;
                var deaths = pvpAllTimeStats.deaths.basic.displayValue;
                var kdRatio = pvpAllTimeStats.killsDeathsRatio.basic.displayValue;
                response = `${response}* ${kills} kills, ${deaths} deaths, ${kdRatio} K/D\r\n`;
                
                var assists = pvpAllTimeStats.assists.basic.displayValue;
                var kdaRatio = pvpAllTimeStats.killsDeathsAssists.basic.displayValue;
                response = `${response}* ${assists} assists, ${kdaRatio} K/D+A\r\n`;

                var revives = pvpAllTimeStats.resurrectionsPerformed.basic.displayValue;
                var orbsDropped = pvpAllTimeStats.orbsDropped.basic.displayValue;
                var suicides = pvpAllTimeStats.suicides.basic.displayValue;
                response = `${response}* ${revives} revives, ${orbsDropped} orbs dropped, ${suicides} suicides\r\n`;

                var winLoss = pvpAllTimeStats.winLossRatio.basic.displayValue;
                var combatRating = pvpAllTimeStats.combatRating.basic.displayValue;
                response = `${response}* ${winLoss} win/loss ratio, ${combatRating} combat rating\r\n`;
                
                callback(null, response);
            } else { callback(err); }
        });
    },
    trialsMap : function(callback) { callback("FeatureNotImplemented")}
    
};