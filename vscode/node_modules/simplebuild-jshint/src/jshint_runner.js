// Copyright (c) 2012-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

/* Run JSHint and print results to console */

(function() {
	"use strict";

	var jshintWrapper = require("./forkable_jshint_wrapper");
	var fs = require("fs");
	var async = require("async");
	var errorTranslator = require("./error_translator.js");
	var workerFarm = require("worker-farm");
	var os = require("os");

	var NUM_CPUS = os.cpus().length;
	var MAX_PARALLEL_FILE_READS = 25;   // arbitrarily chosen based on trial-and-error
	var MIN_FILES_FOR_WORKERS = 35;     // also arbitrarily chosen based on trial-and-error
	var NO_WORKERS = null;
	var WORKER_OPTIONS = {
		// Number of workers chosen based on trial-and-error.
		// Needs to be at least one, though, or worker-farm will behave badly...
		// ...and one worker is just pointless overhead, so the minimum is set to two.
		maxConcurrentWorkers: Math.max(2, NUM_CPUS - 1)
	};

	exports.validateSource = function(sourceCode, options, globals, name, callback) {
		runJsHint(NO_WORKERS, sourceCode, options, globals, name, callback);
	};

	exports.validateFile = function(filename, options, globals, callback) {
		fs.readFile(filename, "utf8", function(err, sourceCode) {
			if (err) return callback(err);

			exports.validateSource(sourceCode, options, globals, filename, callback);
		});
	};

	exports.validateFileList = function(fileList, options, globals, callback) {
		// This worker stuff is completely untested. I'll need to figure that out at some point.
		// We don't use workers if there's only one CPU because the overhead overrides the benefit.
		var workers = (fileList.length >= MIN_FILES_FOR_WORKERS && NUM_CPUS > 1) ?
			workerFarm(WORKER_OPTIONS, require.resolve("./forkable_jshint_wrapper")) :
			NO_WORKERS;

		async.mapLimit(fileList, MAX_PARALLEL_FILE_READS, mapIt, reduceIt);

		function mapIt(filename, mapItCallback) {
			fs.readFile(filename, "utf8", function(err, sourceCode) {
				if (err) return mapItCallback(err);

				process.stdout.write(".");
				runJsHint(workers, sourceCode, options, globals, filename, mapItCallback);
			});
		}

		function reduceIt(err, results) {
			if (workers) workerFarm.end(workers);
			if (err) return callback(err);

			var pass = results.reduce(function(pass, result) {
				return pass && result;
			}, true);

			process.stdout.write("\n");
			return callback(null, pass);
		}
	};

	function runJsHint(workers, sourceCode, options, globals, name, callback) {
		var parameters = {
			sourceCode: sourceCode,
			options: options,
			globals: globals
		};

		if (workers) workers(parameters, processResult);
		else jshintWrapper(parameters, processResult);

		function processResult(err, result) {
			if (err) return callback(err);

			if (!result.pass) reportErrors(result.errors, name);
			return callback(null, result.pass);
		}
	}

	function reportErrors(errors, name) {
		name = name ? name + " " : "";
		console.log("\n" + name + "failed");
		errorTranslator.translate(errors).forEach(function(errorLine) {
			console.log(errorLine);
		});
	}

})();