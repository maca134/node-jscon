var util = require('util');
var async = require('async');
function jscon(data, complete) {
	require('./lib/config').loadFromObject(data);
	var logger = require('./lib/logger');
	var waitforserver = require('./lib/waitforserver');
	var setuprcon = require('./lib/setuprcon');
	async.waterfall([
		function (next) {
			waitforserver(next);
		},
		function (next) {
			setuprcon(next);
		}
	], function (err, rcon) {
		if (err) {
			logger(util.format('error: ', err), 'error');
			process.exit();
		}
		logger('Connected', 'success');
		rcon.on('message', function (message) {
			logger(util.format('Message: %s', message), 'INFO');
		});
		complete(err, rcon);
	});
}

module.exports = jscon;