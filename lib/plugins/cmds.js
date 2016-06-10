var util = require('util');
var moment = require('moment');
var config = require('../config');
var logger = require('../logger');

function Cmds(rcon) {
	if (!config.cmds)
		return;
	var self = this;
	this.started = moment();
	this.rcon = rcon;
	this.rcon.on('chat', data => self._chat(data));
}

Cmds.prototype._chat = function (data) {
	var player = this.rcon.playerlist.getPlayer(data.name);
	if (!player) 
		return;

	var match = data.message.match(/!([a-z]+)?\s?(.*)/i);
	if (!match)
		return;

	var cmd = match[1];
	var args = match[2];
	
	if (config.cmds[cmd])
		return this.rcon.say(config.cmds[cmd], player.id);
	
	switch (cmd) {
		case 'uptime':
			var uptime = moment.duration(moment().diff(this.started)).asMinutes();
			this.rcon.say(util.format('Server uptime: %s minutes', Math.round(uptime)), player.id);
		break;
	}
};

module.exports = function (rcon) {
	logger('Starting Cmds');
	return new Cmds(rcon);
};