var util = require('util');
var colors = require('colors');
var config = require('./config');
module.exports = function logger(log, level) {
	level = level || 'info';
	var message = util.format('[%s] %s', level.toUpperCase(), log);
	switch (level.toUpperCase()) {
		case 'ERROR':
			message = message.red;
		break;
		case 'WARN':
			message = message.yellow;
		break;
		case 'INFO':
			message = message.cyan;
		break;
		case 'DEBUG':
			message = message.grey;
		break;
		case 'SUCCESS':
			message = message.green;
		break;
		case 'CONNECTED':
			message = message.grey;
		break;
		case 'DISCONNECTED':
			message = message.grey;
		break;
		case 'KICK':
			message = message.red.bold;
		break;
		case 'CHAT':
			message = message.bold;
		break;
		default:
			
		break;
	}
	if (config.log.indexOf(level.toUpperCase()) == -1)
		return;
	console.log(message);
};