var util = require('util');
var config = require('../config');
var logger = require('../logger');

function RestartWarnings(rcon) {
	if (!config.restartwarnings)
		return;
	var self = this;
	this.rcon = rcon;
	this.tick = config.restartwarnings.uptime;
	this.interval = setInterval(function () {self._tick();}, 60000);
}

RestartWarnings.prototype._tick = function () {
	var self = this;
	this.tick--;
	if (this.tick == 0)
	{
		clearInterval(this.interval);
		return;
	}
	var warn = config.restartwarnings.warnat.find(w => w == self.tick);
	if (warn) {
		var msg = util.format('Server restarting in %s minute(s)', this.tick);
		logger(msg);
		if (!config.debug)
			this.rcon.say(msg);
	}
	if (config.restartwarnings.lockat > 0 && config.restartwarnings.lockat == this.tick) {
		logger('Locking server');
		if (!config.debug)
			this.rcon.cmd('#lock');
	}
};

module.exports = function (rcon) {
	logger('Starting RestartWarnings');
	return new RestartWarnings(rcon);
};