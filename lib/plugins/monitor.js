var util = require('util');
var colors = require('colors');
var config = require('../config');
var logger = require('../logger');

function Monitor(rcon) {
	if (!config.monitor)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('playerconnect', data => logger(util.format('%s (%s)', data.name, data.ip)), 'connected');
	this.rcon.on('playerdisconnect', data => logger(util.format('%s', data.name)), 'disconnected');
	this.rcon.on('kick', data => logger(util.format('%s for %s', data.name, data.reason)), 'kick');
	this.rcon.on('chat', data => self._chat(data));
}

Monitor.prototype._chat = function (data) {
	var message = util.format('(%s) %s: %s', data.channel, data.name, data.message);
	switch (data.channel) {
		case 'Side':
			message = message.cyan;
		break;
		case 'Group':
			message = message.green;
		break;
		case 'Vehicle':
			message = message.yellow;
		break;
		case 'Direct':
			message = message.white;
		break;
		case 'Global':
			message = message.grey;
		break;
		default:
			message = message.magenta;		
		break;
	}
	logger(message, 'chat');
};

module.exports = function (rcon) {
	logger('Starting Monitor');
	return new Monitor(rcon);
};