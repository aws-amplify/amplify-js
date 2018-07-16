#!/usr/local/bin/node

// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var promisify = require("./examples/extensions/simplebuild-ext-promisify.js")
	.map("../examples/mappers/simplebuild-map-header.js")
	.map;

var jshint = promisify("../examples/tasks/simplebuild-jshint.js");
var mocha = promisify("../examples/tasks/simplebuild-mocha.js");

jshint.validate({
	files: [ "**/*.js", "!node_modules/**/*" ],
	options: lintOptions(),
	globals: lintGlobals()
})
.then(function() {
	return mocha.runTests({
		files: [ "**/_*_test.js", "!node_modules/**/*" ]
	});
})
.then(function() {
	console.log("\n\nBUILD OK");
})
.fail(function(message) {
	console.log("\n\nBUILD FAILED: " + message);
});

function lintOptions() {
	return {
		bitwise: true,
		curly: false,
		eqeqeq: true,
		forin: true,
		immed: true,
		latedef: false,
		newcap: true,
		noarg: true,
		noempty: true,
		nonew: true,
		regexp: true,
		undef: true,
		strict: true,
		trailing: true,
		node: true
	};
}

function lintGlobals() {
	return {
		// Mocha
		describe: false,
		it: false,
		before: false,
		after: false,
		beforeEach: false,
		afterEach: false,
	};
}
