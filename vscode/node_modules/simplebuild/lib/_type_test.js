// Copyright (c) 2013-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("./assert.js");
	var type = require("./type.js");

	describe("Type", function() {

		describe("checker", function() {

			var check = type.check;

			it("checks built-in types", function() {
				assert.isNull(check(false, Boolean), "boolean");
				assert.isNotNull(check(false, String), "not boolean");

				assert.isNull(check("1", String), "string");
				assert.isNotNull(check("1", Number), "not string");

				assert.isNull(check(1, Number), "number");
				assert.isNotNull(check(1, Function), "not number");

				assert.isNull(check(function() {}, Function), "function");
				assert.isNotNull(check(function() {}, Object), "not function");

				assert.isNull(check({}, Object), "object");
				assert.isNotNull(check({}, Array), "not object");

				assert.isNull(check([], Array), "array");
				assert.isNotNull(check([], RegExp), "not array");

				assert.isNull(check(/foo/, RegExp), "regular expression");
				assert.isNotNull(check(/foo/, Boolean), "not regular expression");
			});

			it("checks undefined and null types (primarily for allowing nullable objects, etc.)", function() {
				assert.isNull(check(undefined, undefined), "undefined");
				assert.isNotNull(check(undefined, null), "not undefined");
				assert.isNotNull(check({}, undefined), "bug: comparing object to undefined caused crash");
				assert.isNotNull(check({}, null), "bug: comparing object to null caused crash");

				assert.isNull(check(null, null), "null");
				assert.isNotNull(check(null, NaN), "not null");
			});

			it("checks NaN (just in case you ever want it)", function() {
				assert.isNull(check(NaN, NaN), "NaN");

				assert.isNotNull(check(NaN, undefined), "undefined should not be NaN");
				assert.isNotNull(check(NaN, null), "null should not be NaN");
				assert.isNotNull(check(NaN, Object), "constructors should not be NaN");
			});

			it("checks custom types", function() {
				function MyClass() {}

				var myInstance = new MyClass();

				assert.isNull(check(myInstance, MyClass), "instance of class");
				assert.isNull(check(myInstance, Object), "instance of subclass");
				assert.isNotNull(check({}, MyClass), "instance of superclass");
			});

			it("checks 'structs'", function() {
				assert.isNull(check({ a: 1 }, { a: Number }), "one matching parameter");
				assert.isNotNull(check({ a: 1 }, { a: String }), "one non-matching parameter");

				assert.isNull(check({}, {}), "no parameters");
				assert.isNull(check({ a: 1 }, {}), "extra parameters should be ignored");

				assert.isNull(check({ a: 1, b: "a" }, { a: Number, b: String }), "multiple matching parameters");
				assert.isNotNull(check({ a: 1, b: "a" }, { a: Number, b: Number }), "multiple with non-matching parameter");
			});

			it("supports multiple allowed types", function() {
				assert.isNull(check(1, [String, Number]), "string or number");
				assert.isNotNull(check(1, [String, Object, Boolean]), "not string, object, or boolean");
			});

			it("returns string explaining error", function() {
				assert.equal(check(123, String), "argument must be a string, but it was a number", "normal types");
			});

			it("provides detailed error message when using structs", function() {
				assert.equal(
					check(null, { a: String }),
					"argument must be an object containing { a: <string> }, but it was null",
					"not a struct"
				);
				assert.equal(
					check({}, { a: String }),
					"argument.a must be a string, but it was undefined",
					"top-level struct"
				);
				assert.equal(
					check({ a: { b: 123 }}, { a: { b: String } }),
					"argument.a.b must be a string, but it was a number",
					"nested struct"
				);
			});

			it("provides correct error message when receiving a struct and expecting a primitive", function() {
				assert.equal(
					check({ id: "something" }, Number),
					"argument must be a number, but it was an object"
				);
			});

			it("provides class names when using class instances", function() {
				function One() {}
				function Two() {}

				assert.equal(check(new One(), Two), "argument must be a Two instance, but it was a One instance");
			});

			it("allows argument name to be customized in error message", function() {
				assert.equal(check(1, String, { name: "custom" }), "custom must be a string, but it was a number");
			});

		});

		describe("describer", function() {

			function MyClass() {}

			var forceAnonymity = {};
			var AnonClass = forceAnonymity.whatever = function() {};

			var describe = type.describe;

			it("describes non-object types", function() {
				assert.equal(describe(Boolean), "boolean");
				assert.equal(describe(String), "string");
				assert.equal(describe(Number), "number");
				assert.equal(describe(Function), "function");
				assert.equal(describe(Array), "array");
				assert.equal(describe(undefined), "undefined");
				assert.equal(describe(null), "null");
				assert.equal(describe(NaN), "NaN");
			});

			it("describes object types", function() {
				assert.equal(describe(Object), "object");
				assert.equal(describe(RegExp), "regular expression");
				assert.equal(describe(MyClass), "MyClass instance");
				assert.equal(describe(AnonClass), "<anon> instance");
			});

			it("describes class instances", function() {
				assert.equal(describe(new MyClass()), "MyClass instance");
				assert.equal(describe(new AnonClass()), "<anon> instance");
			});

			it("describes 'structs'", function() {
				assert.equal(describe(Object.create(null)), "object", "no prototype");
				assert.equal(describe({}), "object", "empty object");
				assert.equal(describe({ a: Number }), "object containing { a: <number> }", "one parameter");
				assert.equal(describe({ a: Number, b: String }), "object containing { a: <number>, b: <string> }");
			});

			it("describes multiple types", function() {
				assert.equal(describe([ Boolean ]), "boolean", "one types");
				assert.equal(describe([ Boolean, Object ]), "boolean or object", "two types");
				assert.equal(describe([ Boolean, Object, Number, Function ]), "boolean, object, number, or function", "four types");

				assert.equal(describe([ undefined, Boolean ]), "undefined or boolean", "optional types shouldn't be treated specially");
				assert.equal(describe([ null, Object ]), "null or object", "nullable objects shouldn't be treated specially");
			});

			it("optionally uses articles", function() {
				function MyClass() {}
				var forceAnonymity = {};
				var AnonClass = forceAnonymity.whatever = function() {};

				var options = { articles: true };

				assert.equal(describe(Boolean, options), "a boolean");
				assert.equal(describe(String, options), "a string");
				assert.equal(describe(Number, options), "a number");
				assert.equal(describe(Function, options), "a function");
				assert.equal(describe(Array, options), "an array");
				assert.equal(describe(undefined, options), "undefined");
				assert.equal(describe(null, options), "null");
				assert.equal(describe(NaN, options), "NaN");
				assert.equal(describe(Object, options), "an object", "Object");
				assert.equal(describe(RegExp, options), "a regular expression");
				assert.equal(describe(MyClass, options), "a MyClass instance");
				assert.equal(describe(AnonClass, options), "an <anon> instance");
				assert.equal(describe(new MyClass(), options), "a MyClass instance");
				assert.equal(describe(new AnonClass(), options), "an <anon> instance");
				assert.equal(describe(Object.create(null)), "object");
				assert.equal(describe({}, options), "an object", "{}");
				assert.equal(describe({ a: Number }, options), "an object containing { a: <number> }");
			});

		});

	});

}());