// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// An assertion library that works the way *I* want it to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

var chai = require("chai").assert;

exports.fail = function(message) {
	chai.fail(null, null, message);
};

exports.todo = function() {
	exports.fail("TO DO");
};

exports.defined = function(actual, message) {
	chai.isDefined(actual, message);
};

exports.isUndefined = function(actual, message) {
	chai.isUndefined(actual, message);
};

exports.isTrue = function(actual, message) {
	chai.isTrue(actual, message);
};

exports.isFalse = function(actual, message) {
	chai.isFalse(actual, message);
};

exports.isNull = function(actual, message) {
	chai.isNull(actual, message);
};

exports.isNotNull = function(actual, message) {
	chai.isNotNull(actual, message);
};

exports.equal = function(actual, expected, message) {
	if (expected === undefined) exports.fail("'undefined' provided as expected value in assertion");
	chai.strictEqual(actual, expected, message);
};

exports.deepEqual = function(actual, expected, message) {
	if (expected === undefined) exports.fail("'undefined' provided as expected value in assertion");
	if (message) message += " expected deep equality";
	chai.deepEqual(actual, expected, message);
};

exports.between = function(value, min, max, message) {
	if (message) message += ": ";
	if (value < min || value > max) {
		exports.fail(message + "expected value between " + min + " and " + max + " (inclusive), but was " + value);
	}
};

exports.matches = function(actual, expectedRegex, message) {
	chai.match(actual, expectedRegex, message);
};

exports.noException = function(fn, message) {
	chai.doesNotThrow(fn, message);
};

exports.exception = function(fn, expected, message) {
	chai.throws(fn, expected, undefined, message);
};