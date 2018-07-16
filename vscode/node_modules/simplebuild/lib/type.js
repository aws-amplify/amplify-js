// Copyright (c) 2013-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var arrayToSentence = require("array-to-sentence");

	exports.check = function(arg, expectedTypes, options) {
		var argType = getType(arg);
		if (!Array.isArray(expectedTypes)) expectedTypes = [ expectedTypes ];
		options = options || {};
		options.name = options.name || "argument";

		for (var i = 0; i < expectedTypes.length; i++) {
			if (oneTypeMatches(arg, argType, expectedTypes[i])) {
				if (isStructComparison(argType, expectedTypes[i])) return checkStruct(arg, expectedTypes[i], options);
				else return null;
			}
		}
		return describeError(arg, argType, expectedTypes, options.name);


		function oneTypeMatches(arg, argType, expectedType) {
			if (argType === Object) return checkObject(arg, expectedType);
			else if (Number.isNaN(argType)) return Number.isNaN(expectedType);
			else return argType === expectedType;

			function checkObject(arg, type) {
				if (type === null) return false;
				else if (typeof type === "function") return arg instanceof type;
				else if (typeof type === "object") return typeof arg === "object";
				else return false;
			}
		}

		function isStructComparison(argType, type) {
			return argType === Object && typeof type === "object";
		}

		function checkStruct(arg, type, options) {
			if (typeof type !== "object") throw new Error("unrecognized type: " + type);

			var keys = Object.getOwnPropertyNames(type);
			for (var i = 0; i < keys.length; i++) {
				var newOptions = objectAssignPolyfill({}, options);
				newOptions.name = options.name + "." + keys[i];
				var checkResult = exports.check(arg[keys[i]], type[keys[i]], newOptions);
				if (checkResult !== null) return checkResult;
			}

			return null;
		}

		function describeError(arg, argType, type, name) {
			var describe = exports.describe;
			var articles = { articles: true };
			if (argType === Object && !isStruct(arg)) argType = arg;
			return name + " must be " + describe(type, articles) + ", but it was " + describe(argType, articles);
		}

	};


	exports.describe = function(type, options) {
		if (!Array.isArray(type)) type = [ type ];
		if (options === undefined) options = {};

		var descriptions = type.map(function(oneType) {
			return describeOneType(oneType);
		});
		if (descriptions.length <= 2) return descriptions.join(" or ");
		else return arrayToSentence(descriptions, { lastSeparator: ", or " }); // dat Oxford comma

		function describeOneType(type) {
			switch(type) {
				case Boolean: return options.articles ? "a boolean" : "boolean";
				case String: return options.articles ? "a string" : "string";
				case Number: return options.articles ? "a number" : "number";
				case Function: return options.articles ? "a function" : "function";
				case Array: return options.articles ? "an array" : "array";
				case undefined: return "undefined";
				case null: return "null";

				default:
					if (Number.isNaN(type)) return "NaN";
					else if (typeof type === "function") return describeConstructor(type, options);
					else if (typeof type === "object") {
						if (isStruct(type)) return describeStruct(type, options);
						else return describeInstance(type, options);
					}
					else throw new Error("unrecognized type: " + type);
			}
		}

		function describeConstructor(type, options) {
			var articles = options.articles;

			if (type === Object) return articles ? "an object" : "object";
			else if (type === RegExp) return articles ? "a regular expression" : "regular expression";

			var name = type.name;
			if (name) {
				if (articles) name = "a " + name;
			}
			else {
				name = articles ? "an <anon>" : "<anon>";
			}
			return name + " instance";
		}

		function describeStruct(type, options) {
			var properties = Object.getOwnPropertyNames(type).map(function(key) {
				return key + ": <" + exports.describe(type[key]) + ">";
			});

			var objectDesc = options.articles ? "an object" : "object";
			if (properties.length === 0) {
				return objectDesc;
			}

			var description = " " + properties.join(", ") + " ";
			return objectDesc + " containing {" + description + "}";
		}

		function describeInstance(type, options) {
			var prototypeConstructor = Object.getPrototypeOf(type).constructor;
			var article = options.articles;
			var name = (article ? "a " : "") + prototypeConstructor.name;
			if (!prototypeConstructor.name) name = (article ? "an " : "") + "<anon>";

			return name + " instance";
		}

	};

	function getType(variable) {
		if (variable === null) return null;
		if (Array.isArray(variable)) return Array;
		if (Number.isNaN(variable)) return NaN;

		switch (typeof variable) {
			case "boolean": return Boolean;
			case "string": return String;
			case "number": return Number;
			case "function": return Function;
			case "object": return Object;
			case "undefined": return undefined;

			default:
				throw new Error("Unreachable code executed. Unknown typeof value: " + typeof variable);
		}
	}

	function isStruct(type) {
		var prototype = Object.getPrototypeOf(type);
		return (!prototype || prototype.constructor === Object);
	}


	// This Object.assign() polyfill is based on code found at:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	function objectAssignPolyfill(target, varArgs) {
		/*jshint eqeqeq:false, eqnull:true */
		if (Object.assign) return Object.assign.apply(target, arguments);

		if (target == null) { // TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) { // Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	}
}());
