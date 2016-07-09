var request = require('request');
var config = require('./config');

function postconnect(player, data) {
	type = type || 'info';
	if (!config.reporter.connect)
		return;
	request.post(config.reporter.connect, {
		form: {
			server: config.servername,
			player: player,
			data: data
		}
	});
}

module.exports = postconnect;