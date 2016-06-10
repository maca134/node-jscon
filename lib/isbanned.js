var util = require('util');
var request = require('request');
var async = require('async');
var config = require('./config');
var logger = require('./logger');

var banlist = [];

(function downloadbanlist() {
	async.waterfall([
		function (next) {
			request(config.bans.url, function (err, res, body) {
				next(err, body);
			});
		},
		function (body, next) {
			var list = body.split('\r\n').map(row => {
				var match = row.match(/^([0-9a-zz.]+) -1 (.*)$/);
				if (!match)
					return false;
				return {
					guidip: match[1],
					reason: match[2]
				};
			}).filter(ban => ban !== false);
			process.nextTick(function () {
				next(null, list);
			});
		},
	], function (err, bans) {
		if (err) {
			logger(util.format('Error downloading banlist: %s', err));
		} else {
			logger('Bans updated');
			banlist = bans;
		}
		setTimeout(function () {downloadbanlist();}, config.bans.interval * 1000);
	});
})();

function isbanned(check) {
	return banlist.find(ban => ban.guidip == check);
}

module.exports = isbanned;