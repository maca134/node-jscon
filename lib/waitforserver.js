var config = require('./config');
var logger = require('./logger');
var steamquery = require('./steamquery');
var waitfor = require('./waitfor');

function waitforserver(complete) {
	waitfor(function (next) {
		logger('Attempting to Steam query server...');
		steamquery(config.ip + ':' + config.queryport, next);
	}, 3, 1000, function (err, result) {
		if (err) {
			logger(util.format('Steam query error: %s', err), 'error');
			process.exit(1);
		}
		logger('Server up, starting rcon', 'success');
		complete();
	});
}

module.exports = waitforserver;