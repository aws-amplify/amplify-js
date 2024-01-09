// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	LogLevel,
	LoggerType,
	CreateLoggerInput,
	CreateLoggerOutput,
} from './types';
import { dispatchLogsToProviders } from './dispatchLogsToProviders';
import { LoggingCategory } from '../types';

/**
 * Amplify Logger. Accepts log events and disseminates to configured logging providers.
 **/
class Logger implements LoggerType {
	namespace: string;
	category?: LoggingCategory;

	constructor(namespace: string, category?: LoggingCategory) {
		this.namespace = namespace;
		this.category = category;
	}

	/**
	 * Records a general log event.
	 *
	 * @param {string} message - Logging message
	 * @param {LogLevel} level - Logging level, optional defaults to 'INFO'
	 */
	log(message: string, level: LogLevel = 'INFO') {
		this._log(level, message);
	}

	/**
	 * Records an INFO level log event.
	 *
	 * @param {string} message - Logging message
	 */
	info(message: string) {
		this._log('INFO', message);
	}

	/**
	 * Records an WARN level log event.
	 *
	 * @param {string} message - Logging message
	 */
	warn(message: string) {
		this._log('WARN', message);
	}

	/**
	 * Records an ERROR level log event.
	 *
	 * @param {string} message - Logging message
	 * */
	error(message: string) {
		this._log('ERROR', message);
	}

	/**
	 * Records an DEBUG level log event.
	 *
	 * @param {string} message - Logging message
	 */
	debug(message: string) {
		this._log('DEBUG', message);
	}

	/**
	 * Records an VERBOSE level log event.
	 *
	 * @param {string} message - Logging message
	 */
	verbose(message: string) {
		this._log('VERBOSE', message);
	}

	/**
	 * Sends log event to configured logging providers
	 *
	 * @param {LogLevel} level - Logging level
	 * @param {string} message - Logging message
	 */
	_log(logLevel: LogLevel, message: string) {
		dispatchLogsToProviders({
			namespace: this.namespace,
			category: this.category,
			logLevel,
			message,
		});
	}
}

/**
 * Generates a new Logger which can be used to record log events for the specified.
 *
 * @param input - The {@link CreateLoggerInput} object containing the namespace and an optional category name.
 * @returns Output containing the {@link CreateLoggerOutput} object.
 */
export const createLogger = (input: CreateLoggerInput): CreateLoggerOutput => {
	const { namespace, category } = input;
	return new Logger(namespace, category);
};
