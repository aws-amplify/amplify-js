var prependFile = require('prepend-file');
var fs = require('fs');
var find = require('find');

fs.readFile('LICENSE.txt', 'utf8', function (err, data) {
	if (err) {
		console.log('read file failed', err);
	}

	find.file(/\.js$/, process.argv[2], function (files) {
		for (var i = 0; i < files.length; i++) {
			prependFile(files[i], data, function (prependErr) {
				if (prependErr) {
					console.log(prependErr);
				}
			});
		}
	});
});
