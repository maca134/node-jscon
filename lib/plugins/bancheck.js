var util = require('util');
var config = require('../config');
var isbanned = require('../isbanned');
var logger = require('../logger');

function BanCheck(rcon) {
	if (!config.bancheck)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('playerconnect', data => self._check(data));
	this.rcon.on('guidverified', data => self._check(data));
}

BanCheck.prototype._check = function (data) {
	var check = data.ip || data.guid;
	logger(util.format('Checking player %s', data.name));
	
	var ban = isbanned(check);
	if (!ban)
		return;
	logger(util.format('Player %s is banned: %s', data.name, ban.reason), 'warn');
	
	if (!config.debug)
		rcon.kick(data.id, ban.reason);
};

module.exports = function (rcon) {
	logger('Starting BanCheck');
	return new BanCheck(rcon);
};