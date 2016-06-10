var request = require('request');
var config = require('./config');

function postlog(log, type) {
	type = type || 'info';
	request.post(config.reporter.log, {
		form: {
			server: config.servername,
			type: type,
			log: log
		}
	});
}

module.exports = postlog;