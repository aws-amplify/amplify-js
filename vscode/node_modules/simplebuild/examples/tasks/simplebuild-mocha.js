// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var simplebuild = require("../../lib/simplebuild");
var Mocha = require("mocha");

exports.runTests = function(options, success, failure) {
	var mocha = new Mocha({ui: "bdd"});
	simplebuild.deglobSync(options.files).forEach(function(file) {
		mocha.addFile(file);
	});

	var failures = false;
	mocha.run()
	.on("fail", function() {
		failures = true;
	}).on("end", function() {
		if (failures) failure("Tests failed");
		success();
	});
};

exports.runTests.title = "Mocha";
exports.runTests.description = "Run Mocha tests.";