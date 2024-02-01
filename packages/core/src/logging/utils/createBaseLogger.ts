// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, CreateBaseLogger } from '../types';

export const createBaseLogger: CreateBaseLogger = (
	{ namespace, category },
	logFunction
) => {
	const log = (message: string, logLevel: LogLevel = 'INFO') =>
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
		verbose: (message: string) => log(message, 'VERBOSE'),
		/**
		 * Records an DEBUG level log event.
		 *
		 * @param {string} message - Logging message
		 */
		debug: (message: string) => log(message, 'DEBUG'),
		/**
		 * Records an INFO level log event.
		 *
		 * @param {string} message - Logging message
		 */
		info: (message: string) => log(message, 'INFO'),
		/**
		 * Records an WARN level log event.
		 *
		 * @param {string} message - Logging message
		 */
		warn: (message: string) => log(message, 'WARN'),
		/**
		 * Records an ERROR level log event.
		 *
		 * @param {string} message - Logging message
		 **/
		error: (message: string) => log(message, 'ERROR'),
		/**
		 * Records a general log event.
		 *
		 * @param {string} message - Logging message
		 * @param {LogLevel} logLevel - Logging level, optional defaults to 'INFO'
		 */
		log,
	};
};
