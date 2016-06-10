var config = require('../config');
var logger = require('../logger');
var postchat = require('../postchat');
var postlog = require('../postlog');

function Reporter(rcon) {
	if (!config.reporter)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('kick', data => self._kick(data));
	this.rcon.on('chat', data => self._chat(data));
	postlog('JSCON Starting');
}

Reporter.prototype._kick = function (data) {
	postlog(data.raw, 'kick');
};

Reporter.prototype._chat = function (data) {
	postchat(data.name, data.channel, data.message);
};

module.exports = function (rcon) {
	logger('Starting Reporter');
	return new Reporter(rcon);
};