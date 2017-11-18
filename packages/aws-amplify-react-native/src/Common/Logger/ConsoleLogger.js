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

const LOG_LEVELS = {
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5
};

/**
* Write logs
*/
export class ConsoleLogger {
    /**
     * @param {string} name - Name of the logger
     */
    constructor(name, level = 'INFO') {
        this.name = name;
        this.level = level;
    }

    /**
     * Write log
     * @private
     * @param {string} type - log type, default INFO
     * @param {string|object} msg - Logging message or object
     */
    _log(type, ...msg) {
        let logger_level_name = this.level;
        if (ConsoleLogger.LOG_LEVEL) { logger_level_name = ConsoleLogger.LOG_LEVEL; }
        if ((typeof window != 'undefined') && window.LOG_LEVEL) {
            logger_level_name = window.LOG_LEVEL;
        }
        const logger_level = LOG_LEVELS[logger_level_name];
        const type_level = LOG_LEVELS[type];
        if (!(type_level >= logger_level)) {
            return;
        }

        let log = console.log;

        if (msg.length === 1 && typeof msg[0] === 'string') {
            log('[' + type + '] ' + this.name + ' - ' + msg[0]);
        } else if (msg.length === 1) {
            const key = '[' + type + '] ' + this.name;
            const output = {};
            output[key] = msg[0];
            log(output);
        } else if (typeof msg[0] === 'string') {
            let obj = msg.slice(1);
            if (obj.length === 1) { obj = obj[0]; }
            const key = '[' + type + '] ' + this.name + ' - ' + msg[0];
            const output = {};
            output[key] = obj;
            log(output);
        } else {
            const key = '[' + type + '] ' + this.name;
            const output = {};
            output[key] = msg;
            log(output);
        }
    }

    /**
    * Write General log. Default to INFO
    * @param {string|object} msg - Logging message or object
    */
    log(...msg) { this._log('INFO', ...msg); }

    /**
    * Write INFO log
    * @param {string|object} msg - Logging message or object
    */
    info(...msg) { this._log('INFO', ...msg); }

    /**
    * Write WARN log
    * @param {string|object} msg - Logging message or object
    */
    warn(...msg) { this._log('WARN', ...msg); }

    /**
    * Write ERROR log
    * @param {string|object} msg - Logging message or object
    */
    error(...msg) { this._log('ERROR', ...msg); }

    /**
    * Write DEBUG log
    * @param {string|object} msg - Logging message or object
    */
    debug(...msg) { this._log('DEBUG', ...msg); }

    /**
    * Write VERBOSE log
    * @param {string|object} msg - Logging message or object
    */
    verbose(...msg) { this._log('VERBOSE', ...msg); }
};
