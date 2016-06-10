var fp = require('path');
var jetpack = require('fs-jetpack');
var Rcon = require('./rcon');
var logger = require('./logger');
var config = require('./config');

function setuprcon(complete) {
	var rcon = new Rcon(config);
	var pluginpath = fp.join(__dirname, 'plugins');
	jetpack.list(pluginpath).map(file => fp.join(pluginpath, file)).forEach(file => require(file)(rcon));
	rcon.on('login', function (err) {
		if (err) {
			rcon.disconnect();
			return complete('Error logging into rcon');
		}
		complete(null, rcon);
	});
	rcon.on('disconnected', function () {
		logger('rcon disconnected');
		process.exit();
	});
	rcon.login();
}

module.exports = setuprcon;