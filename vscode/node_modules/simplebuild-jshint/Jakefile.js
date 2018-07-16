// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*global desc, task, jake, fail, complete, directory*/
(function() {
	"use strict";

	var startTime = Date.now();

	var jshint = require("./src/index.js");
	var mocha = require("./build/mocha_runner");

	jake.addListener('complete', function() {
		var elapsedSeconds = (Date.now() - startTime) / 1000;
		console.log("\n\nBUILD OK (" + elapsedSeconds.toFixed(2) + "s)");
	});

	desc("Validate code (lint and test)");
	task("default", [ "lint", "test" ]);

	desc("Lint everything");
	task("lint", function() {
		process.stdout.write("Linting JavaScript: ");
		jshint.checkFiles({
			files: [ "*.js", "src/**/*.js", "build/**/*.js" ],
			options: lintOptions(),
			globals: lintGlobals()
		}, complete, fail);
	}, { async: true });

	desc("Run tests");
	task("test", [], function() {
		console.log("Testing JavaScript:");
		mocha.runTests({
			files: "src/**/_*_test.js",
			options: {
				ui: "bdd",
				reporter: "dot"
			}
		}, complete, fail);
	}, { async: true });

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
			beforeEach: false,
			afterEach: false,
			describe: false,
			it: false
		};
	}

})();