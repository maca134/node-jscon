var extend = require('extend');

function Playerlist() {
	this.players = [];
}
module.exports = Playerlist;

Playerlist.prototype.parse = function (data) {
	this.players = this._parsePlayers(data);
};

Playerlist.prototype.getPlayer = function (name) {
	return this.players.find(player => player.name == name);
};

Playerlist.prototype.updatePlayer = function (row) {
	var player = this.players.find(player => player.id == row.id);
	if (player) {
		player = extend(player, row);
	} else {
		this.players.push(row);
	}
};

Playerlist.prototype.removePlayer = function (id) {
	var index = this.players.findIndex(player => player.id == id);
	if (index > -1) {
		this.players.splice(index, 1);
	}
};

Playerlist.prototype._parsePlayers = function (players) {
	return players.split('\n').map((line) => {
		if (line == "Players on server:")
        	return null;

	    if (line == "[#] [IP Address]:[Port] [Ping] [GUID] [Name]")
	        return null;

	    if (line == "--------------------------------------------------")
	        return null;

	    if (line.indexOf("players in total)") > 0)
	        return null;

		var match = line.match(/^([0-9]+)\s+([0-9\.:]+)\s+([0-9]+)\s+([a-f0-9]+)(\(OK\))?\s+(.*)$/);
		if (!match) 
			return null;

		return {
			name: match[6],
			ip: match[2],
			ping: match[3],
			guid: match[4],
			id: match[1],
		};
	}).filter((player) => {
		return player != null;
	}).map(player => {
		player.ip = player.ip.replace(/:[0-9]+$/, '');
		return player;
	});
};