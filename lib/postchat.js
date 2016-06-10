var request = require('request');
var config = require('./config');

function postchat(player, type, message) {
	request.post(config.reporter.chat, {
		form: {
			server: config.servername,
			player: player,
			type: type,
			message: message
		}
	});
}

module.exports = postchat;