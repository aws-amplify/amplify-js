// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var simplebuild = require("../../lib/simplebuild.js");

module.exports = function(grunt) {
	return {
		loadNpmTasks: function(moduleName) {
			var module = require(moduleName);
			simplebuild.mapTaskModule(module, transform);
		}
	};

	function transform(fn) {
		grunt.registerTask(fn.title, fn.description, function() {
			fn(grunt.config(fn.title), this.async(), grunt.warn);
		});
		return fn;
	}
};