// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	var barebones = require("./tasks/simplebuild-barebones.js");

	barebones.succeed({}, success, failure);
	barebones.fail({}, success, failure);
	barebones.succeedOrFail({ fail: true }, success, failure);

	function success() {
		console.log("Succeeded!");
		console.log();
	}

	function failure(message) {
		console.log("Failed! Message: [" + message + "]");
		console.log();
	}

}());