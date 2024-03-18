// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWS_CLOUDWATCH_CATEGORY } from '../constants';

import { InputLogEvent, LogType, Logger, LoggingProvider } from './types';

const LOG_LEVELS: Record<string, number> = {
	VERBOSE: 1,
	DEBUG: 2,
	INFO: 3,
	WARN: 4,
	ERROR: 5,
	NONE: 6,
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
	static BIND_ALL_LOG_LEVELS = false;

	_padding(n: number) {
		return n < 10 ? '0' + n : '' + n;
	}

	_ts() {
		const dt = new Date();

		return (
			[this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(
				':',
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
		let loggerLevelName = this.level;
		if (ConsoleLogger.LOG_LEVEL) {
			loggerLevelName = ConsoleLogger.LOG_LEVEL;
		}
		if (typeof (window as any) !== 'undefined' && (window as any).LOG_LEVEL) {
			loggerLevelName = (window as any).LOG_LEVEL;
		}
		const loggerLevel = LOG_LEVELS[loggerLevelName];
		const typeLevel = LOG_LEVELS[type];
		if (!(typeLevel >= loggerLevel)) {
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
		if (ConsoleLogger.BIND_ALL_LOG_LEVELS) {
			if (type === LogType.INFO && console.info) {
				log = console.info.bind(console);
			}
			if (type === LogType.DEBUG && console.debug) {
				log = console.debug.bind(console);
			}
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
