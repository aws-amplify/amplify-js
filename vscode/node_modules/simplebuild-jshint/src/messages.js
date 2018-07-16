// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Messages
exports.VALIDATION_FAILED = "JSHint failed.";



/* Descriptors -- not currently used; may be added in the future */

exports.MODULE_DESCRIPTORS = {
	name: "simplebuild-jshint",
	summary: "A simple library for automating JSHint.",
	description: "[JSHint](http://www.jshint.com/) is a static analysis (\"lint\") tool for JavaScript. It analyzes JavaScript source code for common mistakes. This library provides a simple interface to JSHint that's convenient to use with task automation tools such as [Grunt](http://gruntjs.com/) or [Jake](https://github.com/mde/jake).	",
	copyright: "Copyright (c) 2012-2014 James Shore"
};

// Generic descriptors
var OPTIONS_DESCRIPTOR = {
	description: "JSHint options (see [the JSHint documentation](http://www.jshint.com/docs/options/)).",
	default: {}
};
var GLOBALS_DESCRIPTOR = {
	description: "Permitted global variables (for use with the `undef` option). Each variable should be set to `true` or `false`. If false, the variable is considered read-only.",
	default: {}
};

// File list validator
exports.FILE_LIST_VALIDATOR_DESCRIPTORS = {
	title: "JSHint",
	description: "Run JSHint against a list of files. A dot will be written to stdout for each file processed. Any errors will be written to stdout.",
	options: {
		files: {
			description: "A string or array containing the files to check. Globs (`*`) and globstars (`**`) will be expanded to match files and directory trees respectively. Prepend `!` to exclude files.",
		},
		options: OPTIONS_DESCRIPTOR,
		globals: GLOBALS_DESCRIPTOR
	}
};

// One file validator
exports.ONE_FILE_VALIDATOR_DESCRIPTORS = {
	title: "JSHint",
	description: "Run JSHint against a single file (it's useful for auto-generated build dependencies). Any errors will be written to stdout.",
	options: {
		file: {
			description: "A string containing the path to the file to check."
		},
		options: OPTIONS_DESCRIPTOR,
		globals: GLOBALS_DESCRIPTOR
	}
};

// Source validator
exports.SOURCE_VALIDATOR_DESCRIPTORS = {
	title: "JSHint",
	description: "Run JSHint against raw source code. Any errors will be will be written to stdout.",
	options: {
		code: {
			description: "A string containing the source code to check."
		},
		options: OPTIONS_DESCRIPTOR,
		globals: GLOBALS_DESCRIPTOR
	}
};