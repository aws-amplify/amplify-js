// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var glob = require("glob");
var type = require("./type.js");
var objectAssign = require("object-assign");   // Object.assign ponyfill. Check if Node supports it yet.

exports.normalizeOptions = function(userOptions, defaults, types) {
	check(userOptions, Object);
	var normalizedOptions = objectAssign({}, defaults, userOptions);
	check(normalizedOptions, types);
	return normalizedOptions;

	function check(options, types) {
		var err = type.check(options, types, { name: "options" });
		if (err !== null) throw new Error(err);
	}
};

exports.deglobSync = function(globs) {
	if (typeof globs === "string") globs = [ globs ];

	var result = [];
	globs.forEach(expandGlob);
	return result;

	function expandGlob(aGlob) {
		var include = true;
		if (aGlob[0] === "!") {
			aGlob = aGlob.substring(1);
			include = false;
		}

		var expandedGlob = glob.sync(aGlob);

		expandedGlob.forEach(function(aFile) {
			var index = result.indexOf(aFile);
			if (include && index === -1) result.push(aFile);
			else if (!include && index !== -1) result.splice(index, 1);
		});
	}
};

exports.createMapFunction = function(mapperFn) {
	return function(module) {
		return mapModule(module, mapperFn);
	};
};

function mapModule(module, mapperFn) {
	if (typeof module === "string") module = require(module);

	if (Object.keys(module).length === 1 && module.map) return mapMapperModule(module, mapperFn);
	else return mapTaskModule(module, mapperFn);
}

function startsWith(string, substring) {
	return string.indexOf(substring) === 0;
}

function mapMapperModule(mapperModule, mapperFn) {
	return {
		map: function(module) {
			return mapModule(mapperModule.map(module), mapperFn);
		}
	};
}

var mapTaskModule = exports.mapTaskModule = function mapTaskModule(module, mapperFn) {
	var result = {};
	Object.keys(module).forEach(function(key) {
		result[key] = mapperFn(module[key]);
		mapDescriptors(module[key], result[key]);
	});
	return result;
};

function mapDescriptors(srcTask, destTask) {
	// only map descriptors that are defined in the spec; ignore everything else
	map("title");
	map("description");

	function map(descriptor) {
		if (destTask[descriptor] === undefined) destTask[descriptor] = srcTask[descriptor];
	}
}