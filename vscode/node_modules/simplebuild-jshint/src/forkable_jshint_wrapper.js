// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

/* Wrap JSHint with a simple interface suitable for forking as its own process. */

(function() {
	"use strict";

	var jshint = require("jshint").JSHINT;

	// This specific module signature is required for forking to work.
	module.exports = function forkable_jshint_wrapper(parameters, callback) {
		var pass = jshint(parameters.sourceCode, parameters.options, parameters.globals);

		// The errors from the last run are stored globally on the jshint object. Yeah.
		return callback(null, {
			pass: pass,
			errors: jshint.errors
		});
	};

}());