// Copyright (c) 2012-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
"use strict";

	var assert = require("./assert.js");
	var wrapper = require("./forkable_jshint_wrapper.js");

	describe("Forkable JSHint Wrapper", function() {

		it("passes good source code", function(done) {
			wrapper({
				sourceCode: "var a = 1;"
			}, assertPass(done));
		});

		it("fails bad source code", function(done) {
			wrapper({
				sourceCode: "bargledy-bargle"
			}, assertFail(done));
		});

		it("respects options", function(done) {
			wrapper({
				sourceCode: "a = 1",
				options: { asi: true }
			}, assertPass(done));
		});

		it("respects globals", function(done) {
			wrapper({
				sourceCode: "a = 1;",
				options: { undef: true },
				globals: { a: true }
			}, assertPass(done));
		});

		it("DOES NOT support 'globals' option in place of globals parameter", function(done) {
			var globals = { a: true };
			wrapper({
				sourceCode: "a = 1;",
				options: { undef: true, globals: globals }
			}, assertFail(done));
		});

		function assertPass(done) {
			return function(err, result) {
				assert.isTrue(result.pass, "should have passed");
				assert.deepEqual(result.errors, [], "should have no errors");
				done(err);
			};
		}

		function assertFail(done) {
			return function(err, result) {
				assert.isFalse(result.pass, "should have failed");
				assert.isAbove(result.errors.length, 0, "should have at least one error");
				done(err);
			};
		}

	});

})();