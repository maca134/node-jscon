var config = require('../config');
var logger = require('../logger');

function Reporter(rcon) {
	if (!config.reporter)
		return;
	var self = this;
	this.rcon = rcon;
}

module.exports = function (rcon) {
	logger('Starting Reporter');
	return new Reporter(rcon);
};