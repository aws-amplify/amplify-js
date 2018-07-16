// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

/* Provide simplebuild API */

(function() {
	"use strict";

//var simplebuild = require("../../core/lib/simplebuild");
	var simplebuild = require("simplebuild");
	var jshint = require("./jshint_runner.js");
	var messages = require("./messages.js");

	var DEFAULT_OPTIONS = {
		options: {},
		globals: {}
	};

	exports.checkFiles = function checkFiles(userOptions, succeed, fail) {
		try {
			var types = {
				files: [String, Array],
				options: Object,
				globals: Object
			};
			var options = simplebuild.normalizeOptions(userOptions, DEFAULT_OPTIONS, types);
			var files = simplebuild.deglobSync(options.files);

			jshint.validateFileList(files, options.options, options.globals, function(err, passed) {
				if (err) return fail(err.message);

				if (passed) return succeed();
				else return fail(messages.VALIDATION_FAILED);
			});
		}
		catch(err) {
			return fail(err.message);
		}
	};
	//exports.checkFiles.descriptors = messages.FILE_LIST_VALIDATOR_DESCRIPTORS;


	exports.checkOneFile = function checkOneFile(userOptions, succeed, fail) {
		try {
			var types = {
				file: String,
				options: Object,
				globals: Object
			};
			var options = simplebuild.normalizeOptions(userOptions, DEFAULT_OPTIONS, types);

			jshint.validateFile(options.file, options.options, options.globals, function(err, passed) {
				if (err) return fail(err.message);

				if (passed) succeed();
				else fail(messages.VALIDATION_FAILED);
			});
		}
		catch(err) {
			return fail(err.message);
		}
	};
	//exports.checkOneFile.descriptors = messages.ONE_FILE_VALIDATOR_DESCRIPTORS;

	exports.checkCode = function checkCode(userOptions, succeed, fail) {
		try {
			var types = {
				code: String,
				options: Object,
				globals: Object
			};
			var options = simplebuild.normalizeOptions(userOptions, DEFAULT_OPTIONS, types);

			jshint.validateSource(options.code, options.options, options.globals, undefined, function(err, passed) {
				if (err) return fail(err.message);

				if (passed) succeed();
				else fail(messages.VALIDATION_FAILED);
			});
		}
		catch(err) {
			return fail(err.message);
		}
	};
	//exports.checkCode.descriptors = messages.SOURCE_VALIDATOR_DESCRIPTORS;

})();