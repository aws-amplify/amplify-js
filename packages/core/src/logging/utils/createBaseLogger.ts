// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, CreateBaseLogger } from '../types';

export const createBaseLogger: CreateBaseLogger = (
	{ namespace, category },
	logFunction
) => {
	const _log = (message: string, logLevel: LogLevel) =>
		logFunction({
			namespace,
			category,
			logLevel,
			message,
		});

	return {
		/**
		 * Records an VERBOSE level log event.
		 *
		 * @param {string} message - Logging message
		 */
		verbose: (message: string) => _log(message, 'VERBOSE'),
		/**
		 * Records an DEBUG level log event.
		 *
		 * @param {string} message - Logging message
		 */
		debug: (message: string) => _log(message, 'DEBUG'),
		/**
		 * Records an INFO level log event.
		 *
		 * @param {string} message - Logging message
		 */
		info: (message: string) => _log(message, 'INFO'),
		/**
		 * Records an WARN level log event.
		 *
		 * @param {string} message - Logging message
		 */
		warn: (message: string) => _log(message, 'WARN'),
		/**
		 * Records an ERROR level log event.
		 *
		 * @param {string} message - Logging message
		 **/
		error: (message: string) => _log(message, 'ERROR'),
		/**
		 * Records a general log event.
		 *
		 * @param {string} message - Logging message
		 * @param {LogLevel} logLevel - Logging level, optional defaults to 'INFO'
		 */
		log: (message: string, logLevel: LogLevel = 'INFO') =>
			_log(message, logLevel),
	};
};
