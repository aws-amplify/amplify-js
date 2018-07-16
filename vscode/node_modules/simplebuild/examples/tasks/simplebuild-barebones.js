// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	// A bare-bones Simplebuild module to demonstrate how it works.

	// Always succeeds
	exports.succeed = function(options, success, failure) {
		console.log("This will succeed.");
		success();
	};
	exports.succeed.title = "Succeed";
	exports.succeed.description = "A task that always succeeds.";

	// Always fails
	exports.fail = function(options, success, failure) {
		console.log("This will fail.");
		failure("Failed, as requested");
	};
	exports.fail.title = "Fail";
	exports.fail.description = "A task that always fails.";

	// Either succeeds or fails depending on the `fail` option (default false)
	exports.succeedOrFail = function(options, success, failure) {
		console.log("This may succeed or fail.");
		if (options.fail) failure("Failed, as configured");
		else success();
	};
	exports.succeedOrFail.title = "Succeed or Fail";
	exports.succeedOrFail.description = "A task that either succeeds or fails depending on configuration.";

}());