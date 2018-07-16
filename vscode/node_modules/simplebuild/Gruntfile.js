// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

module.exports = function(grunt) {

	var simplebuild = require("./examples/extensions/simplebuild-ext-gruntify.js")(grunt);

	grunt.initConfig({
		JSHint: {
			files: [ "**/*.js", "!node_modules/**/*" ],
			options: lintOptions(),
			globals: lintGlobals()
		},

		Mocha: {
			files: [ "**/_*_test.js", "!node_modules/**/*" ]
		}
	});

	simplebuild.loadNpmTasks("../tasks/simplebuild-jshint");
	simplebuild.loadNpmTasks("../tasks/simplebuild-mocha");

	grunt.registerTask("default", "Lint and test", ["JSHint", "Mocha"]);

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

};