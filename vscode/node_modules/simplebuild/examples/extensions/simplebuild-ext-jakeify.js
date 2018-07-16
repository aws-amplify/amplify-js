// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/* globals jake, task, complete, fail */

"use strict";

var simplebuild = require("../../lib/simplebuild.js");

// Adds a Jake-compatible 'task()' function to every function in a simplebuild module.
exports.map = simplebuild.createMapFunction(transform);

function transform(fn) {
	fn.task = function(taskName, dependencies, options) {
		if (!jake) throw new Error("Jake global not found. Are you running Jake?");

		if (arguments.length === 2) {  // 'dependencies' is optional
			options = dependencies;
			dependencies = [];
		}

		task(taskName, dependencies, { async: true }, function() {
			fn(options, complete, fail);
		});
	};

	return fn;
}
