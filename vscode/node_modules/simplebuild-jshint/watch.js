#!/usr/local/bin/node

// Automatically runs Jake when files change.
//
// Thanks to Davide Alberto Molin for contributing this code.
// See http://www.letscodejavascript.com/v3/comments/live/7 for details.

(function() {
	"use strict";

	var gaze = require("gaze");
	var spawn = require("child_process").spawn;
	var path = require("path");

	var WATCH = [
		"build/**/*.js",
		"src/**/*.js",
		"./Jakefile.js"
	];

	var COMMAND = "./jake.sh";

	var args = process.argv.slice(2);
	var child = null;
	var buildQueued = false;
	var buildStartedAt;

	gaze(WATCH, function(err, watcher) {
		if (err) {
			console.log("WATCH ERROR:", err);
			return;
		}

		console.log("Will run " + COMMAND + " when " + WATCH.join(" or ") + " changes.");
		watcher.on("all", triggerBuild);
		triggerBuild();    // Always run after startup
	});

	function triggerBuild(event, filepath) {
		logEvent(event, filepath);
		if (child === null) runJake();
		else queueAnotherBuild();
	}

	function runJake() {
		buildStartedAt = Date.now();
		console.log("\n*** RUN> " + COMMAND + " " + args.join(" "));
		child = spawn(COMMAND, args, { stdio: "inherit" });

		child.once("exit", function(code) {
			child = null;
		});
	}

	function queueAnotherBuild() {
		if (buildQueued) return;
		if (debounce()) return;

		console.log("*** Build queued");
		buildQueued = true;
		child.once("exit", function(code) {
			buildQueued = false;
			triggerBuild();
		});

		function debounce() {
			var msSinceLastBuild = Date.now() - buildStartedAt;
			return msSinceLastBuild < 1000;
		}
	}

	function logEvent(event, filepath) {
		if (filepath === undefined) return;

		var truncatedPath = path.basename(path.dirname(filepath)) + "/" + path.basename(filepath);
		console.log("*** " + event.toUpperCase() + ": .../" + truncatedPath);
	}

}());
