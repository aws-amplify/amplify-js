// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var simplebuild = require("../../lib/simplebuild.js");
var jshint = require("./jshint/jshint_runner.js");

exports.validate = function(options, success, failure) {
	var result = jshint.validateFileList(
		simplebuild.deglobSync(options.files),
		options.options,
		options.globals
	);
	if (result) success();
	else failure("JSHint found errors.");
};

exports.validate.title = "JSHint";
exports.validate.description = "Lint files using JSHint.";