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

import { Logger } from './logger-interface';

const LOG_LEVELS = {
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
export class ConsoleLogger implements Logger {
    name: string;
    level: string;

    /**
    * @constructor
    * @param {string} name - Name of the logger
    */
    constructor(name, level = 'WARN') {
        this.name = name;
        this.level = level;
    }

    static LOG_LEVEL = null;

    _padding(n) {
        return n < 10? '0' + n : '' + n;
    }

    _ts() {
        const dt = new Date();
        return [
            this._padding(dt.getMinutes()),
            this._padding(dt.getSeconds())
        ].join(':') + '.' + dt.getMilliseconds();
    }

    /**
    * Write log
    * @method
    * @memeberof Logger
    * @param {string} type - log type, default INFO
    * @param {string|object} msg - Logging message or object
    */
    _log(type: string, ...msg) {
        let logger_level_name = this.level;
        if (ConsoleLogger.LOG_LEVEL) { logger_level_name = ConsoleLogger.LOG_LEVEL; }
        if ((typeof <any>window !== 'undefined') && (<any>window).LOG_LEVEL) {
            logger_level_name = (<any>window).LOG_LEVEL;
        }
        const logger_level = LOG_LEVELS[logger_level_name];
        const type_level = LOG_LEVELS[type];
        if (!(type_level >= logger_level)) {
            // Do nothing if type is not greater than or equal to logger level (handle undefined)
            return;
        }

        let log = console.log.bind(console);
        if (type === 'ERROR' && console.error) { log = console.error.bind(console); }
        if (type === 'WARN' && console.warn) { log = console.warn.bind(console); }

		const prefix = `[${type}] ${this._ts()} ${this.name}`;

        if (msg.length === 1 && typeof msg[0] === 'string') {
            log(`${prefix} - ${msg[0]}`);
        } else if (msg.length === 1) {
            log(prefix, msg[0]);
        } else if (typeof msg[0] === 'string') {
            let obj = msg.slice(1);
            if (obj.length === 1) { obj = obj[0]; }
            log(`${prefix} - ${msg[0]}`, obj);
        } else {
            log(prefix, msg);
        }
    }

    /**
    * Write General log. Default to INFO
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    log(...msg) { this._log('INFO', ...msg); }

    /**
    * Write INFO log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    info(...msg) { this._log('INFO', ...msg); }

    /**
    * Write WARN log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    warn(...msg) { this._log('WARN', ...msg); }

    /**
    * Write ERROR log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    error(...msg) { this._log('ERROR', ...msg); }

    /**
    * Write DEBUG log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    debug(...msg) { this._log('DEBUG', ...msg); }

    /**
    * Write VERBOSE log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    verbose(...msg) { this._log('VERBOSE', ...msg); }
}
