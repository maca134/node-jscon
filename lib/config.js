var cjson = require('cjson');
var extend = require('extend');

function Data() {};

Data.prototype.loadFromFile = function (file) {
	extend(this, cjson.load(file));
};

Data.prototype.loadFromObject = function (data) {
	extend(this, data);
};

var data = new Data();

module.exports = data;
