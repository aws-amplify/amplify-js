// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	// Chai doesn't work exactly the way I want it to, so I tweak it to work the way *I* want.
	// <old-man-voice>Get off my lawn!</>

	var assert = require("chai").assert;

	// 'module.exports = assert' doesn't work because it's a shallow copy. Any changes (such when we
	// overwrite exports.fail) changes Chai's functions. In the case of export.fail, it causes an infinite
	// loop. Oops.
	Object.keys(assert).forEach(function(property) {
		exports[property] = assert[property];
	});

	exports.fail = function(message) {
		assert.fail(null, null, message);
	};

	exports.equal = function(actual, expected, message) {
		assert.strictEqual(actual, expected, message);
	};

}());