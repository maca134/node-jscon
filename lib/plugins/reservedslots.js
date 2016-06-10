var util = require('util');
var config = require('../config');
var logger = require('../logger');
var issub = require('../issub');

function ReservedSlots(rcon) {
	if (!config.reservedslots)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('guidverified', data => self._guidverified(data));
}

ReservedSlots.prototype._guidverified = function (data) {
	var freeslots = this.rcon.steamquery.maxPlayers - this.rcon.steamquery.numberOfPlayers;
	if (freeslots > config.reservedslots.slots)
		return;

	if (issub(data.guid)) {
		logger(util.format('Player is sub %s %s', data.id, data.guid));
		return;
	}
	logger(util.format('Kicking player %s %s', data.id, data.guid));
	if (!config.debug)
		this.rcon.kick(data.id, config.reservedslots.kickmessage);
};

module.exports = function (rcon) {
	logger('Starting ReservedSlots');
	return new ReservedSlots(rcon);
};