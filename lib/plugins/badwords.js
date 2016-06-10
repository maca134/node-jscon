var util = require('util');
var config = require('../config');
var logger = require('../logger');

function BadWords(rcon) {
	if (!config.badwords)
		return;
	var self = this;
	this.rcon = rcon;
	this.rcon.on('chat', data => self._chat(data));
}

BadWords.prototype._chat = function (data) {
	var player = this.rcon.playerlist.getPlayer(data.name);
	if (!player) 
		return;

	var word = this._badword(data.message);
	if (!word) 
		return;

	logger(util.format('Kicking %s (%s) for saying %s', player.name, player.guid, word), 'warn');
	if (!config.debug)
		this.rcon.kick(player.id, util.format('Bad Word Kick - Please do not say that!'));
};

BadWords.prototype._badword = function (check) {
	return config.badwords.find(word => new RegExp('\\b' + word + '\\b', 'i').test(check));
};

module.exports = function (rcon) {
	logger('Starting BadWords');
	return new BadWords(rcon);
};