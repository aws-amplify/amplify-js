"use strict";
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
var LOG_LEVELS = {
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5
};
/**
* Write logs
* @class Logger
*/
var ConsoleLogger = /** @class */ (function () {
    /**
    * @constructor
    * @param {string} name - Name of the logger
    */
    function ConsoleLogger(name, level) {
        if (level === void 0) { level = 'WARN'; }
        this.name = name;
        this.level = level;
    }
    ConsoleLogger.prototype._padding = function (n) {
        return n < 10 ? '0' + n : '' + n;
    };
    ConsoleLogger.prototype._ts = function () {
        var dt = new Date();
        return [
            this._padding(dt.getMinutes()),
            this._padding(dt.getSeconds())
        ].join(':') + '.' + dt.getMilliseconds();
    };
    /**
    * Write log
    * @method
    * @memeberof Logger
    * @param {string} type - log type, default INFO
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype._log = function (type) {
        var msg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            msg[_i - 1] = arguments[_i];
        }
        var logger_level_name = this.level;
        if (ConsoleLogger.LOG_LEVEL) {
            logger_level_name = ConsoleLogger.LOG_LEVEL;
        }
        if ((typeof window !== 'undefined') && window.LOG_LEVEL) {
            logger_level_name = window.LOG_LEVEL;
        }
        var logger_level = LOG_LEVELS[logger_level_name];
        var type_level = LOG_LEVELS[type];
        if (!(type_level >= logger_level)) {
            // Do nothing if type is not greater than or equal to logger level (handle undefined)
            return;
        }
        var log = console.log.bind(console);
        // if (type === 'ERROR' && console.error) { log = console.error.bind(console); }
        if (type === 'WARN' && console.warn) {
            log = console.warn.bind(console);
        }
        if (msg.length === 1 && typeof msg[0] === 'string') {
            var output = [
                '[' + type + ']',
                this._ts(),
                this.name,
                '-',
                msg[0]
            ].join(' ');
            log(output);
        }
        else if (msg.length === 1) {
            var output = {};
            var key = '[' + type + '] ' + this._ts() + ' ' + this.name;
            output[key] = msg[0];
            log(output);
        }
        else if (typeof msg[0] === 'string') {
            var obj = msg.slice(1);
            if (obj.length === 1) {
                obj = obj[0];
            }
            var output = {};
            var key = '[' + type + '] ' + this._ts() + ' ' + this.name + ' - ' + msg[0];
            output[key] = obj;
            log(output);
        }
        else {
            var output = {};
            var key = '[' + type + '] ' + this._ts() + ' ' + this.name;
            output[key] = msg;
            log(output);
        }
    };
    /**
    * Write General log. Default to INFO
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.log = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['INFO'].concat(msg));
    };
    /**
    * Write INFO log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.info = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['INFO'].concat(msg));
    };
    /**
    * Write WARN log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.warn = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['WARN'].concat(msg));
    };
    /**
    * Write ERROR log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.error = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['ERROR'].concat(msg));
    };
    /**
    * Write DEBUG log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.debug = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['DEBUG'].concat(msg));
    };
    /**
    * Write VERBOSE log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    ConsoleLogger.prototype.verbose = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, ['VERBOSE'].concat(msg));
    };
    ConsoleLogger.LOG_LEVEL = null;
    return ConsoleLogger;
}());
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=ConsoleLogger.js.map