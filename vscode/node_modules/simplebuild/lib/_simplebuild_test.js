// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("./assert.js");
	var simplebuild = require("./simplebuild.js");
	var type = require("./type.js");

	describe("Simplebuild API", function() {

		describe("normalizeOptions()", function() {

			var normalize = simplebuild.normalizeOptions;
			var normalizeFn = function() {
				var args = arguments;
				return function() {
					normalize.apply(this, args);
				};
			};

			it("throws an error when options aren't an object", function() {
				var userOptions = "foo";

				assert.exception(normalizeFn(userOptions, {}, {}), "options must be an object, but it was a string");
			});

			it("checks options' types", function() {
				var userOptions = { a: 1 };
				var types = { a: Number };

				assert.noException(normalizeFn(userOptions, {}, types));
			});

			it("throws an error when types don't match", function() {
				var userOptions = { a: "a" };
				var types = { a: Number };

				assert.exception(normalizeFn(userOptions, {}, types), "options.a must be a number, but it was a string");
			});

			it("copies default values into options without overriding originals", function() {
				var userOptions = { a: 1, c: 3 };
				var defaults = { b: 2, c: "XX" };
				var options = normalize(userOptions, defaults, {});

				assert.deepEqual(options, { a: 1, b: 2, c: 3 });
			});

			it("applies defaults before checking types", function() {
				var userOptions = {};
				var defaults = { a: 1 };
				var types = { a: Number };

				assert.noException(normalizeFn(userOptions, defaults, types));
			});

		});

	});

}());
