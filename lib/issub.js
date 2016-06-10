var util = require('util');
var request = require('request');
var async = require('async');
var bigInt = require("big-integer");
var CryptoJS = require("crypto-js");
var config = require('./config');
var logger = require('./logger');

var sublist = [];

function uid2Guid(uid) {
	if (!uid) {
        return;
    }
    var steamId = bigInt(uid);
    var parts = [0x42, 0x45, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 2; i < 10; i++) {
        var res = steamId.divmod(256);
        steamId = res.quotient;
        parts[i] = res.remainder.toJSNumber();
    }
    var wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(parts));
    var hash = CryptoJS.MD5(wordArray);
    return hash.toString();
};

(function downloadsublist() {
	async.waterfall([
		function (next) {
			request(config.reservedslots.url, function (err, res, body) {
				next(err, body);
			});
		},
		function (body, next) {
			var subs = [];
			try {
				subs = JSON.parse(body).map(function (row) {
					var steamid = row.pid || row.steamid;
					return steamid.match(/^[0-9]+$/) ? uid2Guid(steamid) : false;
				});
			} catch (e) {
				logger(util.format('error parsing json: %s', e));
			}
			process.nextTick(function () {
				next(null, subs);
			});
		},
	], function (err, subs) {
		if (err) {
			logger(util.format('Error downloading sublist: %s', err));
		} else {
			logger('Sublist updated');
			sublist = subs;
		}
		setTimeout(function () {
			downloadsublist();
		}, config.reservedslots.interval * 1000);
	});
})();

function issub(check) {
	return sublist.indexOf(check) > -1;
}

module.exports = issub;