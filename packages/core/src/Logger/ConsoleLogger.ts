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

import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import { LoggerEvent, LoggingProvider } from '../types';
import { AWS_CLOUDWATCH_CATEGORY } from '../Util/Constants';
import { Logger } from './logger-interface';

export const LOG_LEVELS = {
	VERBOSE: 1,
	DEBUG: 2,
	INFO: 3,
	WARN: 4,
	ERROR: 5,
};

export enum LOG_TYPE {
	DEBUG = 'DEBUG',
	ERROR = 'ERROR',
	INFO = 'INFO',
	WARN = 'WARN',
	VERBOSE = 'VERBOSE',
}

/**
 * Write logs
 * @class Logger
 */
export class ConsoleLogger implements Logger {
	name: string;
	level: LOG_TYPE | string;
	private _pluggables: LoggingProvider[];
	private _config: object;

	private static pluggables: LoggingProvider[] = [];
	public static addPluggable(pluggable: LoggingProvider) {
		ConsoleLogger.pluggables.push(pluggable);
	}

	/**
	 * @constructor
	 * @param {string} name - Name of the logger
	 */
	constructor(name: string, level: LOG_TYPE | string = LOG_TYPE.WARN) {
		this.name = name;
		this.level = level;
		this._pluggables = [];
	}

	static LOG_LEVEL = null;

	_padding(n) {
		return n < 10 ? '0' + n : '' + n;
	}

	_ts() {
		const dt = new Date();
		return (
			[this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(
				':'
			) +
			'.' +
			dt.getMilliseconds()
		);
	}

	configure(config?: object) {
		if (!config) return this._config;

		this._config = config;

		return this._config;
	}

	_logGlobal(type: LOG_TYPE | string, ...msg) {
		for (const pluggable of ConsoleLogger.pluggables) {
			pluggable.pushLogs([this._generateLoggerEvent(type, msg)]);
		}
	}

	_generateLoggerEvent(type: LOG_TYPE | string, msg: any[]): LoggerEvent {
		let strMessage = '';
		let data;
		let error: LoggerEvent['loggerInfo']['error'];

		if (msg.length === 1 && typeof msg[0] === 'string') {
			strMessage = msg[0];
		} else if (msg.length === 1) {
			data = msg[0];
		} else if (typeof msg[0] === 'string') {
			let obj = msg.slice(1);
			if (obj.length === 1) {
				obj = obj[0];
			}
			strMessage = msg[0];

			if (obj instanceof Error) {
				error = {
					message: obj.message,
					name: obj.name,
				};
			}

			data = obj;
		} else {
			data = msg;
		}

		return {
			message: strMessage,
			timestamp: Date.now(),
			loggerInfo: {
				level: type.toLowerCase(),
				name: this.name,
				data,
				error,
			},
		};
	}
	/**
	 * Write log
	 * @method
	 * @memeberof Logger
	 * @param {LOG_TYPE|string} type - log type, default INFO
	 * @param {string|object} msg - Logging message or object
	 */
	_log(type: LOG_TYPE | string, ...msg) {
		this._logGlobal(type, ...msg);

		let logger_level_name = this.level;
		if (ConsoleLogger.LOG_LEVEL) {
			logger_level_name = ConsoleLogger.LOG_LEVEL;
		}
		if (typeof (<any>window) !== 'undefined' && (<any>window).LOG_LEVEL) {
			logger_level_name = (<any>window).LOG_LEVEL;
		}
		const logger_level = LOG_LEVELS[logger_level_name];
		const type_level = LOG_LEVELS[type];
		if (!(type_level >= logger_level)) {
			// Do nothing if type is not greater than or equal to logger level (handle undefined)
			return;
		}

		let log = console.log.bind(console);
		if (type === LOG_TYPE.ERROR && console.error) {
			log = console.error.bind(console);
		}
		if (type === LOG_TYPE.WARN && console.warn) {
			log = console.warn.bind(console);
		}

		const prefix = `[${type}] ${this._ts()} ${this.name}`;
		let message = '';

		if (msg.length === 1 && typeof msg[0] === 'string') {
			message = `${prefix} - ${msg[0]}`;
			log(message);
		} else if (msg.length === 1) {
			message = `${prefix} ${msg[0]}`;
			log(prefix, msg[0]);
		} else if (typeof msg[0] === 'string') {
			let obj = msg.slice(1);
			if (obj.length === 1) {
				obj = obj[0];
			}
			message = `${prefix} - ${msg[0]} ${obj}`;
			log(`${prefix} - ${msg[0]}`, obj);
		} else {
			message = `${prefix} ${msg}`;
			log(prefix, msg);
		}

		for (const plugin of this._pluggables) {
			const logEvent: InputLogEvent = { message, timestamp: Date.now() };
			plugin.pushLogs([logEvent]);
		}
	}

	/**
	 * Write General log. Default to INFO
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	log(...msg) {
		this._log(LOG_TYPE.INFO, ...msg);
	}

	/**
	 * Write INFO log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	info(...msg) {
		this._log(LOG_TYPE.INFO, ...msg);
	}

	/**
	 * Write WARN log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	warn(...msg) {
		this._log(LOG_TYPE.WARN, ...msg);
	}

	/**
	 * Write ERROR log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	error(...msg) {
		this._log(LOG_TYPE.ERROR, ...msg);
	}

	/**
	 * Write DEBUG log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	debug(...msg) {
		this._log(LOG_TYPE.DEBUG, ...msg);
	}

	/**
	 * Write VERBOSE log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	verbose(...msg) {
		this._log(LOG_TYPE.VERBOSE, ...msg);
	}

	addPluggable(pluggable: LoggingProvider) {
		if (pluggable && pluggable.getCategoryName() === AWS_CLOUDWATCH_CATEGORY) {
			this._pluggables.push(pluggable);
			pluggable.configure(this._config);
		}
	}

	listPluggables() {
		return this._pluggables;
	}
}
