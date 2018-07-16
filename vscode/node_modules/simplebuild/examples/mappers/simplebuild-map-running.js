// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var simplebuild = require("../../lib/simplebuild.js");

// A Simplebuild extension that takes a Simplebuild module and wraps every function in a "running... done" message.
exports.map = simplebuild.createMapFunction(transform);

function transform(fn) {
	return function(options, success, failure) {
		console.log("Running...");
		fn(options, done(success), done(failure));
	};

	function done(fn) {
		return function() {
			console.log("...done.");
			fn.apply(this, arguments);
		};
	}
}
