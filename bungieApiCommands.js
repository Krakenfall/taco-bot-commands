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
    pveSummary : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var response = `Destiny PvE Summary for ${username}:\r\n`;
                var pveAllTimeStats = stats.mergedAllCharacters.results.allPvE.allTime;
                var pvePlayTime = pveAllTimeStats.secondsPlayed.basic.displayValue;
                var pveGamesPlayed = pveAllTimeStats.activitiesEntered.basic.displayValue;
                response = `${response}* PvE play time: ${pvePlayTime}, ${pveGamesPlayed} activities played\r\n`;

                var kills = pveAllTimeStats.kills.basic.displayValue;
                var deaths = pveAllTimeStats.deaths.basic.displayValue;
                var kdRatio = pveAllTimeStats.killsDeathsRatio.basic.displayValue;
                response = `${response}* ${kills} kills, ${deaths} deaths, ${kdRatio} K/D\r\n`;
                
                var assists = pveAllTimeStats.assists.basic.displayValue;
                var kdaRatio = pveAllTimeStats.killsDeathsAssists.basic.displayValue;
                response = `${response}* ${assists} assists, ${kdaRatio} K/D+A\r\n`;

                var revives = pveAllTimeStats.resurrectionsPerformed.basic.displayValue;
                var revived = pveAllTimeStats.resurrectionsReceived.basic.displayValue;
                var suicides = pveAllTimeStats.suicides.basic.displayValue;
                response = `${response}* ${revives} revives, revived ${revived} times, ${suicides} suicides\r\n`;

                var orbsGathered = pveAllTimeStats.orbsGathered.basic.displayValue;
                var orbsDropped = pveAllTimeStats.orbsDropped.basic.displayValue;
                var suicides = pveAllTimeStats.suicides.basic.displayValue;
                response = `${response}* ${orbsDropped} orbs dropped, ${orbsGathered} orbs picked up\r\n`;

                var publicEventsCompleted = pveAllTimeStats.publicEventsCompleted.basic.displayValue;
                var publicEventsJoined = pveAllTimeStats.publicEventsJoined.basic.displayValue;
                response = `${response}* ${publicEventsCompleted} public events completed, ${publicEventsJoined} public events joined\r\n`;
                
                var coOAttempts = pveAllTimeStats.courtOfOryxAttempts.basic.displayValue;
                var coOWinsCompletions = pveAllTimeStats.courtOfOryxCompletions.basic.displayValue;
                var coOWinsTier3 = pveAllTimeStats.courtOfOryxWinsTier3.basic.displayValue;
                response = `${response}Court of Oryx attempts:\r\n`;
                response = `${response}* ${coOAttempts} attempts, ${coOWinsCompletions} completions, ${coOWinsTier3} tier 3 completions\r\n`;
                
                callback(null, response);
            } else { callback(err); }
        });
    },
    pveKills : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var response = `${username}\'s Destiny PvE kill stats:\r\n`;
                var pveAllTimeStats = stats.mergedAllCharacters.results.allPvE.allTime;
                var kills = pveAllTimeStats.kills.basic.displayValue;
                var kdRatio = pveAllTimeStats.killsDeathsRatio.basic.displayValue;
                response = `${response}* Total Kills: ${kills}, ${kdRatio} K/D\r\n`;
                
                var superKills = pveAllTimeStats.weaponKillsSuper.basic.displayValue;
                var abilityKills = pveAllTimeStats.abilityKills.basic.displayValue;
                response = `${response}* ${superKills} super kills, ${abilityKills} ability kills\r\n`;
                
                var meleeKills = pveAllTimeStats.weaponKillsMelee.basic.displayValue;
                var grenadeKills = pveAllTimeStats.weaponKillsGrenade.basic.displayValue;
                response = `${response}* ${meleeKills} melee kills, ${grenadeKills} grenade kills\r\n`;

                var defKills = pveAllTimeStats.defensiveKills.basic.displayValue;
                var offKills = pveAllTimeStats.offensiveKills.basic.displayValue;
                var precisionKills = pveAllTimeStats.precisionKills.basic.displayValue;
                response = `${response}* ${offKills} offensive kills, ${defKills} defensive kills, ${precisionKills} precision kills\r\n`;

                response = `${response}* Best single activity kills: ${pveAllTimeStats.bestSingleGameKills.basic.displayValue}\r\n`;
                response = `${response}* Longest killing spree: ${pveAllTimeStats.longestKillSpree.basic.displayValue}\r\n`;
                response = `${response}* Most precision kills: ${pveAllTimeStats.mostPrecisionKills.basic.displayValue}\r\n`;
                response = `${response}* Longest kill distance: ${pveAllTimeStats.longestKillDistance.basic.displayValue}\r\n`;
                response = `${response}* Average kill distance: ${pveAllTimeStats.averageKillDistance.basic.displayValue}\r\n`;
                
                callback(null, response);
            } else { callback(err); }
        });
    },
    pvpSummary : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var response = `Destiny PvP Summary for ${username}:\r\n`;
                var pvpAllTimeStats = stats.mergedAllCharacters.results.allPvP.allTime;
                var pvpPlayTime = pvpAllTimeStats.secondsPlayed.basic.displayValue;
                var pvpGamesPlayed = pvpAllTimeStats.activitiesEntered.basic.displayValue;
                response = `${response}* PvP play time: ${pvpPlayTime}, ${pvpGamesPlayed} games played\r\n`;

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

                var wins = pvpAllTimeStats.activitiesWon.basic.displayValue;
                var winLoss = pvpAllTimeStats.winLossRatio.basic.displayValue;
                var combatRating = pvpAllTimeStats.combatRating.basic.displayValue;
                response = `${response}* ${wins} wins, ${winLoss} win/loss ratio, ${combatRating} combat rating\r\n`;
                
                callback(null, response);
            } else { callback(err); }
        });
    },
    pvpKdRatio : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var kills = pvpAllTimeStats.kills.basic.displayValue;
                var deaths = pvpAllTimeStats.deaths.basic.displayValue;
                var kdRatio = pvpAllTimeStats.killsDeathsRatio.basic.displayValue;
                var response = `${username} KD ratio is ${kdRatio} (${kills} kills/${deaths} deaths)`;                
                callback(null, response);
            } else { callback(err); }
        });
    },
    pvpKills : function(membershipType, username, callback) {
        retrieveAccountStats(membershipType, username, function(err, stats) {
            if (!err) {
                var response = `${username}\'s Destiny PvP kill stats:\r\n`;
                var pvpAllTimeStats = stats.mergedAllCharacters.results.allPvP.allTime;
                var kills = pvpAllTimeStats.kills.basic.displayValue;
                response = `${response}* Total Kills: ${kills}\r\n`;
                
                var superKills = pvpAllTimeStats.weaponKillsSuper.basic.displayValue;
                var abilityKills = pvpAllTimeStats.abilityKills.basic.displayValue;
                response = `${response}* ${superKills} super kills, ${abilityKills} ability kills\r\n`;
                
                var meleeKills = pvpAllTimeStats.weaponKillsMelee.basic.displayValue;
                var grenadeKills = pvpAllTimeStats.weaponKillsGrenade.basic.displayValue;
                response = `${response}* ${meleeKills} melee kills, ${grenadeKills} grenade kills\r\n`;

                var defKills = pvpAllTimeStats.defensiveKills.basic.displayValue;
                var offKills = pvpAllTimeStats.offensiveKills.basic.displayValue;
                var precisionKills = pvpAllTimeStats.precisionKills.basic.displayValue;
                response = `${response}* ${offKills} offensive kills, ${defKills} defensive kills, ${precisionKills} precision kills\r\n`;

                response = `${response}* Best single game kills: ${pvpAllTimeStats.bestSingleGameKills.basic.displayValue}\r\n`;
                response = `${response}* Longest killing spree: ${pvpAllTimeStats.longestKillSpree.basic.displayValue}\r\n`;
                response = `${response}* Most precision kills: ${pvpAllTimeStats.mostPrecisionKills.basic.displayValue}\r\n`;
                response = `${response}* Longest kill distance: ${pvpAllTimeStats.longestKillDistance.basic.displayValue}\r\n`;
                response = `${response}* Average kill distance: ${pvpAllTimeStats.averageKillDistance.basic.displayValue}\r\n`;
                
                callback(null, response);
            } else { callback(err); }
        });
    },
    trialsMap : function(callback) { callback("FeatureNotImplemented")}
    
};