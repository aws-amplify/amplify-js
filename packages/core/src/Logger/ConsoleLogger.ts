// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InputLogEvent, Logger, LoggingProvider, LogType } from './types';
import { AWS_CLOUDWATCH_CATEGORY } from '../constants';

const LOG_LEVELS: Record<string, number> = {
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
export class ConsoleLogger implements Logger {
	name: string;
	level: LogType | string;
	private _pluggables: LoggingProvider[];
	private _config?: object;

	/**
	 * @constructor
	 * @param {string} name - Name of the logger
	 */
	constructor(name: string, level: LogType | string = LogType.WARN) {
		this.name = name;
		this.level = level;
		this._pluggables = [];
	}

	static LOG_LEVEL: string | null = null;

	_padding(n: number) {
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

	/**
	 * Write log
	 * @method
	 * @memeberof Logger
	 * @param {LogType|string} type - log type, default INFO
	 * @param {string|object} msg - Logging message or object
	 */
	_log(type: LogType | string, ...msg: any) {
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
		if (type === LogType.ERROR && console.error) {
			log = console.error.bind(console);
		}
		if (type === LogType.WARN && console.warn) {
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
	log(...msg: any) {
		this._log(LogType.INFO, ...msg);
	}

	/**
	 * Write INFO log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	info(...msg: any) {
		this._log(LogType.INFO, ...msg);
	}

	/**
	 * Write WARN log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	warn(...msg: any) {
		this._log(LogType.WARN, ...msg);
	}

	/**
	 * Write ERROR log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	error(...msg: any) {
		this._log(LogType.ERROR, ...msg);
	}

	/**
	 * Write DEBUG log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	debug(...msg: any) {
		this._log(LogType.DEBUG, ...msg);
	}

	/**
	 * Write VERBOSE log
	 * @method
	 * @memeberof Logger
	 * @param {string|object} msg - Logging message or object
	 */
	verbose(...msg: any) {
		this._log(LogType.VERBOSE, ...msg);
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
