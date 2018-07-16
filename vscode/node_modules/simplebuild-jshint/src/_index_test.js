// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./assert.js");
var jshint = require("./index.js");
var messages = require("./messages.js");
var stdout = require("test-console").stdout;
var testFiles = require("./__test_files.js");

describe("Simplebuild module", function() {

	var restoreStdout;
	var successArgs;
	var failureArgs;

	beforeEach(function() {
		successArgs = null;
		failureArgs = null;
		restoreStdout = stdout.ignore();
	});

	afterEach(function() {
		restoreStdout();
	});

	describe("source validator", function() {

		//it("has descriptors", function() {
		//	expect(jshint.checkCode.descriptors).to.eql(messages.SOURCE_VALIDATOR_DESCRIPTORS);
		//});

		it("calls success() callback on success", function(done) {
			jshint.checkCode({
				code: "var a = 1;"
			}, expectSuccess(done), expectNoFailure(done));
		});

		it("calls failure() callback on failure", function(done) {
			jshint.checkCode({
				code: "bargledy-bargle"
			}, expectNoSuccess(done), expectFailure(done, undefined, messages.VALIDATION_FAILED));
		});

		it("passes 'options' option through to JSHint", function(done) {
			jshint.checkCode({
				code: "a = 1;",
				options: { undef: true },
			}, expectNoSuccess(done), expectFailure(done, undefined, messages.VALIDATION_FAILED));
		});

		it("passes 'global' option through to JSHint", function(done) {
			jshint.checkCode({
				code: "a = 1;",
				options: { undef: true },
				globals: { a: true }
			}, expectSuccess(done), expectNoFailure(done));
		});

		it("fails when no code is provided", function(done) {
			jshint.checkCode({}, expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable isn't an object", function(done) {
			jshint.checkCode("foo", expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable is null", function(done) {
			jshint.checkCode(null, expectNoSuccess(done), expectFailure(done));
		});

	});


	describe("single file validator", function() {

		//it("has descriptors", function() {
		//	expect(jshint.checkOneFile.descriptors).to.eql(messages.ONE_FILE_VALIDATOR_DESCRIPTORS);
		//});

		it("calls success() callback on success", function(done) {
			var files = testFiles.write("var a = 1;");
			jshint.checkOneFile({
				file: files.filenames[0]
			}, expectSuccess(done, files), expectNoFailure(done, files));
		});

		it("calls failure() callback on failure", function(done) {
			var files = testFiles.write("nonsense-to-force-a-failure");
			jshint.checkOneFile({
				file: files.filenames[0]
			}, expectNoSuccess(done, files), expectFailure(done, files, messages.VALIDATION_FAILED));
		});

		it("passes 'options' option through to JSHint", function(done) {
			var files = testFiles.write("a = 1;");
			jshint.checkOneFile({
				file: files.filenames[0],
				options: { undef: true }
			}, expectNoSuccess(done, files), expectFailure(done, files, messages.VALIDATION_FAILED));
		});

		it("passes 'globals' option through to JSHint", function(done) {
			var files = testFiles.write("a = 1;");
			jshint.checkOneFile({
				file: files.filenames[0],
				options: { undef: true },
				globals: { a: true }
			}, expectSuccess(done, files), expectNoFailure(done, files));
		});

		it("fails when no file is provided", function(done) {
			jshint.checkOneFile({}, expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable isn't an object", function(done) {
			jshint.checkOneFile("foo", expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable is null", function(done) {
			jshint.checkOneFile(null, expectNoSuccess(done), expectFailure(done));
		});

		it("fails when file doesn't exist", function(done) {
			var expectedMessage = "ENOENT: no such file or directory, open 'no-such-file.js'";
			jshint.checkOneFile({
				file: "no-such-file.js"
			}, expectNoSuccess(done), expectFailure(done, undefined, expectedMessage));
		});

	});


	describe("file list validator", function() {

		//it("has descriptors", function() {
		//	expect(jshint.checkFiles.descriptors).to.eql(messages.FILE_LIST_VALIDATOR_DESCRIPTORS);
		//});

		it("calls success() callback on success", function(done) {
			var files = testFiles.write("var a = 1;");
			jshint.checkFiles({
				files: files.filenames
			}, expectSuccess(done, files), expectNoFailure(done, files));
		});

		it("calls failure() callback on failure", function(done) {
			var files = testFiles.write("bargledy-bargle");
			jshint.checkFiles({
				files: files.filenames
			}, expectNoSuccess(done, files), expectFailure(done, files, messages.VALIDATION_FAILED));
		});

		it("supports globs", function(done) {
			var files = testFiles.write("var a = 1;", "bargledy-bargle");
			jshint.checkFiles({
				files: [ "temp_files/*" ]
			}, expectNoSuccess(done, files), expectFailure(done, files, messages.VALIDATION_FAILED));
		});

		it("passes 'options' option through to JSHint", function(done) {
			var files = testFiles.write("a = 1;");
			jshint.checkFiles({
				files: files.filenames,
				options: { undef: true }
			}, expectNoSuccess(done, files), expectFailure(done, files, messages.VALIDATION_FAILED));
		});

		it("passes 'global' option through to JSHint", function(done) {
			var files = testFiles.write("a = 1;");
			jshint.checkFiles({
				files: files.filenames,
				options: { undef: true },
				globals: { a: true }
			}, expectSuccess(done, files), expectNoFailure(done, files));
		});

		it("fails when no code is provided", function(done) {
			jshint.checkFiles({}, expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable isn't an object", function(done) {
			jshint.checkFiles("foo", expectNoSuccess(done), expectFailure(done));
		});

		it("fails when option variable is null", function(done) {
			jshint.checkFiles(null, expectNoSuccess(done), expectFailure(done));
		});

		it("skips files that don't exist", function(done) {
			jshint.checkFiles({
				files: "no-such-file.js"
			}, expectSuccess(done), expectNoFailure(done));
		});

	});

	function success() {
		successArgs = toArray(arguments);
	}

	function failure() {
		failureArgs = toArray(arguments);
	}

	function toArray(args) {
		return Array.prototype.slice.call(args);
	}

	function expectSuccess(done, files) {
		return function() {
			if (files) files.delete();
			done();
		};
	}

	function expectNoSuccess(done, files) {
		return function() {
			if (files) files.delete();
			assert.fail("should not succeed");
			done();
		};
	}

	function expectFailure(done, files, expectedMessage) {
		return function(actualMessage) {
			if (files) files.delete();
			if (expectedMessage) assert.equal(actualMessage, expectedMessage);
			done();
		};
	}

	function expectNoFailure(done, files) {
		return function() {
			if (files) files.delete();
			assert.fail("should not fail");
			done();
		};
	}

});
