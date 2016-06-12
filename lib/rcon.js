var util = require('util');
var events = require('events');
var extend = require('extend');
var BattleNode = require('./battlenode');
var steamquery = require('./steamquery');
var logger = require('./logger');
var PlayerList = require('./playerlist');
var postlog = require('./postlog');

var default_options = {
	ip: '127.0.0.1',
	rconport: 2302,
	queryport: 2303,
	password: 'password',
	steaminterval: 1,
	playerlistinterval: 5
};

function Rcon(options) {
	var self = this;
	this.playerlist = new PlayerList();
	this.steamquery = {};
	this.options = extend({}, default_options, options);
	this.beclient = new BattleNode({
		ip: this.options.ip,
		port: this.options.rconport,
		rconPassword: this.options.password
	});
	this.beclient.on('login', function (err) {self._login(err);});
	this.beclient.on('disconnected', function () {self._disconnect();});
	this.beclient.on('message', function (message) {self._message(message);});
}

util.inherits(Rcon, events.EventEmitter);

Rcon.prototype.login = function () {
	this.beclient.login();
};

Rcon.prototype.disconnect = function () {
	this.beclient.disconnect();
};

Rcon.prototype.refreshSteamQuery = function () {
	var self = this;
	steamquery(this.options.ip + ':' + this.options.queryport, function (err, data) {
		if (err) {
			//postlog(util.format('Server might be down: %s', err), 'error');
			logger(util.format('Steam Query Error: %s', err), 'error');
		} else {
			self.steamquery = data;
			self.emit('steamquery', self.steamquery);
			logger('Steam query updated', 'debug');
		}
		self.refreshSteamQueryTimeout = setTimeout(function () {
			self.refreshSteamQuery();
		}, self.options.steaminterval * 1000);
	});
};

Rcon.prototype.refreshPlayerList = function () {
	var self = this;
	this.beclient.sendCommand('players', function (players) {
		self.playerlist.parse(players);
		self.emit('playerlist', self.playerlist.players);
		logger('Player list updated', 'debug');
		self.refreshPlayerListTimeout = setTimeout(function () {
			self.refreshPlayerList();
		}, self.options.playerlistinterval * 1000);
	});
};

Rcon.prototype.say = function (message, player) {
	player = player || -1;
	if (isNaN(player)) {
		player = this.getPlayer(player).id;
	}
	this.beclient.sendCommand(util.format('say %s %s', player, message));
};

Rcon.prototype.kick = function (player, reason) {
	player = player || -1;
	if (isNaN(player)) {
		player = this.getPlayer(player);
	}
	this.beclient.sendCommand(util.format('kick %s %s', player.id, reason));
};

Rcon.prototype.ban = function (player, reason) {
	player = player || -1;
	if (isNaN(player)) {
		player = this.getPlayer(player);
	}
	this.beclient.sendCommand(util.format('ban %s %s', player.id, reason));
};

Rcon.prototype.cmd = function (cmd) {
	this.beclient.sendCommand(cmd);
};

Rcon.prototype._login = function (err) {
	this.emit('login', err);
	if (err) return;
	this.refreshSteamQuery();
	this.refreshPlayerList();
	var self = this;
};

Rcon.prototype._disconnect = function () {
	clearTimeout(this.refreshPlayerListTimeout);
	clearTimeout(this.refreshSteamQueryTimeout);
	this.emit('disconnected');
};

Rcon.prototype._message = function (message) {
	var playerconnect = message.match(/^Player #([0-9]+) (.*) \(([0-9\.:]+)\) connected$/);
	if (playerconnect) {
		var row = {
			id: playerconnect[1],
			name: playerconnect[2],
			ip: playerconnect[3],
			raw: message
		};
		this.playerlist.updatePlayer(row);
		return this.emit('playerconnect', row);
	}

	var guidunverified = message.match(/^Player #([0-9]+) (.*) - GUID: ([a-f0-9]+) \(unverified\)$/);
	if (guidunverified) {
		return this.emit('guidunverified', {
			id: guidunverified[1],
			name: guidunverified[2],
			guid: guidunverified[3],
			raw: message
		});
	}

	var guidverified = message.match(/^Verified GUID \(([a-f0-9]+)\) of player #([0-9]+) (.*)$/);
	if (guidverified) {
		var row = {
			id: guidverified[2],
			name: guidverified[3],
			guid: guidverified[1],
			raw: message
		};
		this.playerlist.updatePlayer(row);
		return this.emit('guidverified', row);
	}

	var playerdisconnect = message.match(/^Player #([0-9]+) (.*) disconnected$/);
	if (playerdisconnect) {
		var row = {
			id: playerdisconnect[1],
			name: playerdisconnect[2],
			raw: message
		};
		this.playerlist.removePlayer(row.id);
		return this.emit('playerdisconnect', row);
	}

	var kick = message.match(/^Player #([0-9]+) (.*) \(([a-f0-9]+)\) has been kicked by BattlEye: (.*)$/);
	if (kick) {
		var row = {
			id: kick[1],
			name: kick[2],
			guid: kick[3],
			reason: kick[4],
			raw: message
		};
		this.playerlist.removePlayer(row.id);
		return this.emit('kick', row);
	}

	var chat = message.match(/^\(([a-zA-Z]+)\) (.*): (.*)$/);
	if (chat) {
		return this.emit('chat', {
			channel: chat[1],
			name: chat[2],
			message: chat[3],
			raw: message
		});
	}

	this.emit('message', message);
};

module.exports = Rcon;