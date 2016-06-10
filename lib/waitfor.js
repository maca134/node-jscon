function waitfor(condition, tries, interval, complete) {
	var waitcount = 0;
	(function fnc() {
		condition(function (err, result) {
			waitcount++;
			if (err && waitcount <= tries) {
				return setTimeout(function () {
					fnc();
				}, interval);
			}
			if (err && waitcount > tries) {
				return complete('timeout');
			}
			complete(null, result);
		});
	})();
}

module.exports = waitfor;