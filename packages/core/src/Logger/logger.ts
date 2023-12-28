// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, Logger as ILogger } from './types';
import { administrateLogger } from './administrateLogger';
import { GenerateLogger } from './types';
import { LoggerCategory } from '../types';

/**
 * Write logs
 * @class Logger
 **/
class Logger implements ILogger {
	namespace: string;
	category?: LoggerCategory;

	constructor(namespace: string, category?: LoggerCategory) {
		this.namespace = namespace;
		this.category = category;
	}

	/**
	 * Write log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 * @param {LogLevel} level - Logging level, optional defaults to 'INFO'
z	 */
	log(message: string, level: LogLevel = 'INFO') {
		this._log(level, message);
	}

	/**
	 * Write INFO log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 */
	info(message: string) {
		this._log('INFO', message);
	}

	/**
	 * Write WARN log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 */
	warn(message: string) {
		this._log('WARN', message);
	}

	/**
	 * Write ERROR log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 * */
	error(message: string) {
		this._log('ERROR', message);
	}

	/**
	 * Write DEBUG log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 */
	debug(message: string) {
		this._log('DEBUG', message);
	}

	/**
	 * Write VERBOSE log
	 * @method
	 * @memeberof Logger
	 * @param {string} message - Logging message
	 */
	verbose(message: string) {
		this._log('VERBOSE', message);
	}

	_log(logLevel: LogLevel, message: string) {
		administrateLogger({ namespace: this.namespace, logLevel, message });
	}
}

export const generateLogger: GenerateLogger = ({ namespace, category }) =>
	new Logger(namespace, category);
