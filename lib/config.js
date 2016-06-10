var fp = require('path');
var util = require('util');
var cjson = require('cjson');
var jetpack = require('fs-jetpack');
var colors = require('colors');

var configpath = (process.argv[2]) ? process.argv[2] : fp.join(__dirname, '..', 'config.json');
if (!jetpack.exists(configpath)) {
	console.log('Config file not set or doesnt exist: %s'.red, configpath);
	process.exit(1);
}
module.exports = cjson.load(configpath);