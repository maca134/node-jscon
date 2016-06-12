#!/usr/bin/env node
var fp = require('path');
var cjson = require('cjson');
var colors = require('colors');
var jetpack = require('fs-jetpack');

var jscon = require('../');

var configpath = (process.argv[2]) ? process.argv[2] : fp.join(__dirname, '..', 'config.json');
if (!jetpack.exists(configpath)) {
	console.log('Config file not set or doesnt exist: %s'.red, configpath);
	process.exit(1);
}

jscon(cjson.load(configpath), function (err) {
	if (err) return console.log('There has been an error: %s'.red, err);
	console.log('JSCON running'.green);
});