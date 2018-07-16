// Copyright (c) 2012-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
"use strict";

	var assert = require("./assert.js");
	var runner = require("./jshint_runner.js");
	var stdout = require("test-console").stdout;
	var testFiles = require("./__test_files.js");

	describe("JSHint runner", function() {

		var restoreStdout;

		beforeEach(function() {
			restoreStdout = stdout.ignore();
		});

		afterEach(function() {
			restoreStdout();
		});

		describe("Source code validation", function() {

			it("passes good source code", function(done) {
				runner.validateSource("var a = 1;", undefined, undefined, undefined, assertPass(done));
			});

			it("fails bad source code", function(done) {
				runner.validateSource("bargledy-bargle", undefined, undefined, undefined, assertFail(done));
			});

			it("respects options", function(done) {
				runner.validateSource("a = 1", { asi: true }, undefined, undefined, assertPass(done));
			});

			it("respects globals", function(done) {
				runner.validateSource("a = 1;", { undef: true }, { a: true }, undefined, assertPass(done));
			});

			it("says nothing on pass", function(done) {
				var inspect = stdout.inspect();
				runner.validateSource("", {}, {}, undefined, function(err) {
					inspect.restore();
					assert.deepEqual(inspect.output, []);
					done(err);
				});
			});

			it("reports errors on failure", function(done) {
				var inspect = stdout.inspect();
				runner.validateSource("foo;", {}, {}, undefined, function(err) {
					inspect.restore();
					assert.deepEqual(inspect.output, [
						"\nfailed\n",
						"1: foo;\n",
						"   Expected an assignment or function call and instead saw an expression. (W030)\n",
					]);
					done(err);
				});
			});

			it("includes optional description on failure", function(done) {
				var inspect = stdout.inspect();
				runner.validateSource("foo;", {}, {}, "(description)", function(err) {
					inspect.restore();
					assert.deepEqual(inspect.output[0], "\n(description) failed\n");
					done(err);
				});
			});
		});

		describe("File validation", function() {

			it("respects options", function(done) {
				var files = testFiles.write("var a=1");
				runner.validateFile(files.filenames[0], { asi: true }, undefined, assertPass(done, files));
			});

			it("respects globals", function(done) {
				var files = testFiles.write("a = 1;");
				runner.validateFile(files.filenames[0], { undef: true }, { a: true }, assertPass(done, files));
			});

			it("fails when file is invalid", function(done) {
				var files = testFiles.write("YARR");
				runner.validateFile(files.filenames[0], {}, {}, assertFail(done, files));
			});

			it("reports nothing on success", function(done) {
				var inspect = stdout.inspect();
				var files = testFiles.write("var a=1;");
				runner.validateFile(files.filenames[0], {}, {}, function(err) {
					inspect.restore();
					files.delete();
					assert.deepEqual(inspect.output, []);
					done(err);
				});
			});

			it("reports filename on failure (as well as normal error messages)", function(done) {
				var inspect = stdout.inspect();
				var files = testFiles.write("foo;");
				runner.validateFile(files.filenames[0], {}, {}, function(err) {
					inspect.restore();
					files.delete();
					assert.equal(inspect.output[0], "\n" + files.filenames[0] + " failed\n");
					done(err);
				});
			});

		});


		describe("File list validation", function() {

			var files;

			it("respects options", function(done) {
				var files = testFiles.write("var a=1");
				runner.validateFileList(files.filenames, { asi: true }, {}, assertPass(done, files));
			});

			it("respects globals", function(done) {
				var files = testFiles.write("a = 1;");
				runner.validateFileList(files.filenames, { undef: true }, { a: true }, assertPass(done, files));
			});

			it("passes when all files are valid", function(done) {
				var files = testFiles.write("var a=1;", "var b=1;", "var c=1;");
				runner.validateFileList(files.filenames, {}, {}, assertPass(done, files));
			});

			it("fails when any file is invalid", function(done) {
				var files = testFiles.write("var a=1;", "var b=1;", "YARR", "var d=1;");
				runner.validateFileList(files.filenames, {}, {}, assertFail(done, files));
			});

			it("returns error when file doesn't exist (or other exception occurs)", function(done) {
				runner.validateFileList([ "no-such-file.js" ], {}, {}, function(err) {
					assert.isDefined(err);
					assert.equal(err.message, "ENOENT: no such file or directory, open 'no-such-file.js'");
					done();
				});
			});

			it("reports one dot per file", function(done) {
				var inspect = stdout.inspect();
				var files = testFiles.write("var a=1;", "var b=1;", "var c=1;");
				runner.validateFileList(files.filenames, {}, {}, function() {
					inspect.restore();
					files.delete();
					assert.deepEqual(inspect.output, [".", ".", ".", "\n"]);
					done();
				});
			});

			it("validates all files even if one file fails", function(done) {
				var inspect = stdout.inspect();
				var files = testFiles.write("YARR=1", "var b=1;", "var c=1;");
				runner.validateFileList(files.filenames, {}, {}, function() {
					inspect.restore();
					files.delete();
					assert.include(inspect.output, "\n" + files.filenames[0] + " failed\n");
					done();
				});
			});

		});
	});

	function assertPass(done, files) {
		return function(err, pass) {
			if (files !== undefined) files.delete();
			assert.isTrue(pass, "should have passed");
			done(err);
		};
	}

	function assertFail(done, files) {
		return function(err, pass) {
			if (files !== undefined) files.delete();
			assert.isFalse(pass, "should have failed");
			done(err);
		};
	}

})();