// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var simplebuild = require("../../lib/simplebuild.js");

// A Simplebuild extension that adds a header to Simplebuild modules.
exports.map = simplebuild.createMapFunction(transform);

function transform(fn) {
	return function(options, success, failure) {
		var underline = new Array(fn.title.length + 1).join("=");

		console.log();
		console.log(fn.title);
		console.log(underline);
		fn(options, success, failure);
	};
}
