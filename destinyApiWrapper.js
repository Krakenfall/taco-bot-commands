var request = require('request');
var configService = require('./services/configuration.js');
var configFileName = "config.json";
var config = configService.GetConfigurationSync(configFileName);

const baseBungieUrl = "https://www.bungie.net";
const bungieApiUrl = `${baseBungieUrl}/Platform/Destiny`;
var baseRequest = request.defaults({ headers: { 'X-API-Key': config.bungieApi.key } });
var getInfo = function (url, callback) {
    baseRequest(url, function (err, res, body) {
        if (!err && res.statusCode < 400) {
            var parsed = JSON.parse(body);
            if (parsed.ErrorCode === 1) {
                callback(null, JSON.parse(body).Response);
            } else {
                callback(`ErrorCode ${parsed.ErrorCode}: ${parsed.ErrorStatus} ${parsed.Message}`)
            }
        } else {
            callback(err || `ERROR CODE ${res.statusCode}`);
        }
    });
};

module.exports = {
    getMembershipId : function(membershipType, username, callback) {
        var accountIdUri = `${bungieApiUrl}/${membershipType}/Stats/GetMembershipIdByDisplayName/${username}/`;
        getInfo(accountIdUri, function (err, membershipId) {
            if (err) {
                callback(`Failed getMembershipId: ${err}`);
            } else if (membershipId === 0 || membershipId === "0") {
                callback(`Character ${username} not found.`)
            } else {
                callback(null, membershipId);
            }
        });
    },

    getAccountSummary : function(membershipType, username, membershipId, callback) {
        var accountSummaryUri = `${bungieApiUrl}/${membershipType}/Account/${membershipId}/Summary`;
        getInfo(accountSummaryUri, function (err, summary) {
            if (err) {
                callback(`Failed getAccountSummary: ${err}`);
            } else {
                callback(null, summary);
            }
        });
    },

    getAccountStats : function(membershipType, membershipId, callback) {
        var accountStatsUrl = `${bungieApiUrl}/Stats/Account/${membershipType}/${membershipId}/`
        getInfo(accountStatsUrl, function (err, accountStats) {
            if (err) {
                callback(`Failed getAccountStats: ${err}`);
            } else {
                callback(null, accountStats);
            }
        });
    },

    getActivityHistory : function(membershipType, membershipId, characterId, callback) {
        var historyUrl = `${bungieApiUrl}/Stats/ActivityHistory/${membershipType}/${membershipId}/${characterId}/`;
        getInfo(historyUrl, function (err, history) {
            if (err) {
                callback(`Failed getActivityHistory: ${err}`);
            } else {
                callback(null, history);
            }
        });
    },

    getPostCarnageReport : function(activityId, callback) {
        var reportUrl = `${bungieApiUrl}/Stats/PostGameCarnageReport/${activityId}/`;
        getInfo(reportUrl, function (err, report) {
            if (err) {
                callback(`Failed getPostCarnageReport: ${err}`);
            } else {
                callback(null, report);
            }
        });
    },

    getXurData : function(callback) {
        var xurUrl = `${bungieApiUrl}/Advisors/Xur/`;
        getInfo(xurUrl, function (err, xurData) {
            if (err) {
                callback(`Failed getXurData: ${err}`);
            } else {
                callback(null, xurData);
            }
        });
    },

    getAdvisorData : function(callback) {
        var advUrl = `${bungieApiUrl}/Advisors/V2/`;
        getInfo(advUrl, function (err, advData) {
            if (err) {
                callback(`Failed getAdvisorData: ${err}`);
            } else {
                callback(null, advData);
            }
        });
    }
};