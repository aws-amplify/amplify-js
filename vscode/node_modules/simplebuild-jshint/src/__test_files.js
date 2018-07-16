// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var fs = require("fs");
	var assert = require("./assert.js");

	var testRoot = "temp_files/file-list-validation.js-";

	exports.write = function write() {
		return createFiles(Array.prototype.slice.call(arguments));
	};

	exports.writeSync = function writeSync() {
		var fileBodies = allButLastArgument(arguments);
		var fn = lastArgument(arguments);

		var files = createFiles(fileBodies);
		try {
			fn(files.filenames);
		}
		finally {
			files.delete();
		}
	};

	function createFiles(fileBodies) {
		var filenames = fileBodies.map(createOneFile);

		return {
			filenames: filenames,
			delete: function restore() {
				filenames.forEach(deleteFile);
			}
		};
	}

	function createOneFile(fileBody, index) {
		var testFile = testRoot + index;
		fs.writeFileSync(testFile, fileBody);
		return testFile;
	}

	function deleteFile(testFile) {
		fs.unlinkSync(testFile);
		assert.ok(!fs.existsSync(testFile), "Could not delete test file: " + testFile);
	}

	function allButLastArgument(args) {
		return Array.prototype.slice.call(args, 0, -1);
	}

	function lastArgument(args) {
		return args[args.length - 1];
	}

})();