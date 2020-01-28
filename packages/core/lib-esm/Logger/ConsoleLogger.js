/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var __spreadArrays =
	(this && this.__spreadArrays) ||
	function() {
		for (var s = 0, i = 0, il = arguments.length; i < il; i++)
			s += arguments[i].length;
		for (var r = Array(s), k = 0, i = 0; i < il; i++)
			for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
				r[k] = a[j];
		return r;
	};
var LOG_LEVELS = {
	VERBOSE: 1,
	DEBUG: 2,
	INFO: 3,
	WARN: 4,
	ERROR: 5,
};
/**
 * Write logs
 * @class Logger
 */
var ConsoleLogger = /** @class */ (function() {
	/**
	 * @constructor
	 * @param {string} name - Name of the logger
	 */
	function ConsoleLogger(name, level) {
		if (level === void 0) {
			level = 'WARN';
		}
		this.name = name;
		this.level = level;
	}
	ConsoleLogger.prototype._padding = function(n) {
		return n < 10 ? '0' + n : '' + n;
	};
	ConsoleLogger.prototype._ts = function() {
		var dt = new Date();
		return (
			[this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(
				':'
			) +
			'.' +
			dt.getMilliseconds()
		);
	};
	/**
	 * Write log
	 * @method
	 * @memeberof Logger
	 * @param {string} type - log type, default INFO
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype._log = function(type) {
		var msg = [];
		for (var _i = 1; _i < arguments.length; _i++) {
			msg[_i - 1] = arguments[_i];
		}
		var logger_level_name = this.level;
		if (ConsoleLogger.LOG_LEVEL) {
			logger_level_name = ConsoleLogger.LOG_LEVEL;
		}
		if (typeof window !== 'undefined' && window.LOG_LEVEL) {
			logger_level_name = window.LOG_LEVEL;
		}
		var logger_level = LOG_LEVELS[logger_level_name];
		var type_level = LOG_LEVELS[type];
		if (!(type_level >= logger_level)) {
			// Do nothing if type is not greater than or equal to logger level (handle undefined)
			return;
		}
		var log = console.log.bind(console);
		if (type === 'ERROR' && console.error) {
			log = console.error.bind(console);
		}
		if (type === 'WARN' && console.warn) {
			log = console.warn.bind(console);
		}
		var prefix = '[' + type + '] ' + this._ts() + ' ' + this.name;
		if (msg.length === 1 && typeof msg[0] === 'string') {
			log(prefix + ' - ' + msg[0]);
		} else if (msg.length === 1) {
			log(prefix, msg[0]);
		} else if (typeof msg[0] === 'string') {
			var obj = msg.slice(1);
			if (obj.length === 1) {
				obj = obj[0];
			}
			log(prefix + ' - ' + msg[0], obj);
		} else {
			log(prefix, msg);
		}
	};
	/**
	 * Write General log. Default to INFO
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.log = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['INFO'], msg));
	};
	/**
	 * Write INFO log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.info = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['INFO'], msg));
	};
	/**
	 * Write WARN log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.warn = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['WARN'], msg));
	};
	/**
	 * Write ERROR log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.error = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['ERROR'], msg));
	};
	/**
	 * Write DEBUG log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.debug = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['DEBUG'], msg));
	};
	/**
	 * Write VERBOSE log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	ConsoleLogger.prototype.verbose = function() {
		var msg = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			msg[_i] = arguments[_i];
		}
		this._log.apply(this, __spreadArrays(['VERBOSE'], msg));
	};
	ConsoleLogger.LOG_LEVEL = null;
	return ConsoleLogger;
})();
export { ConsoleLogger };
//# sourceMappingURL=ConsoleLogger.js.map
