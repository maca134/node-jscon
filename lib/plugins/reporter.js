var util = require('util');
var request = require('request');
var config = require('../config');
var logger = require('../logger');
var postchat = require('../postchat');
var postlog = require('../postlog');
var postconnect = require('../postconnect');

function Reporter(rcon) {
	if (!config.reporter)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('kick', data => self._kick(data));
	this.rcon.on('chat', data => self._chat(data));
	this.rcon.on('playerconnect', data => self._playerconnect(data));
	this.rcon.on('guidverified', data => self._guidverified(data));
	this.rcon.on('playerdisconnect', data => self._playerdisconnect(data));
	postlog('JSCON Starting');
}

Reporter.prototype._kick = function (data) {
	postlog(data.raw, 'kick');
};

Reporter.prototype._chat = function (data) {
	postchat(data.name, data.channel, data.message);
};

Reporter.prototype._playerconnect = function (data) {
	postconnect(util.format('Player connected: %s %s', data.name, data.ip), 'connect');
};

Reporter.prototype._guidverified = function (data) {
	postconnect(util.format('Player connected: %s %s', data.name, data.guid), 'connect');
};

Reporter.prototype._playerdisconnect = function (data) {
	postlog(util.format('Player connected: %s', data.name), 'disconnect');
};

module.exports = function (rcon) {
	logger('Starting Reporter');
	return new Reporter(rcon);
};