// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggerType, LogParams, CreateLoggerInput } from '../types';

type LogContext = CreateLoggerInput;
type LogFunction = (input: LogParams) => void;

export const createBaseLogger = (
	{ namespace, category }: LogContext,
	logFunction: LogFunction
): LoggerType => ({
	/**
	 * Records an VERBOSE level log event.
	 *
	 * @param {string} message - Logging message
	 */
	verbose: (message: string) =>
		logFunction({
			namespace,
			category,
			logLevel: 'VERBOSE',
			message,
		}),
	/**
	 * Records an DEBUG level log event.
	 *
	 * @param {string} message - Logging message
	 */
	debug: (message: string) =>
		logFunction({
			namespace,
			category,
			logLevel: 'DEBUG',
			message,
		}),
	/**
	 * Records an INFO level log event.
	 *
	 * @param {string} message - Logging message
	 */
	info: (message: string) =>
		logFunction({
			namespace,
			category,
			logLevel: 'INFO',
			message,
		}),
	/**
	 * Records an WARN level log event.
	 *
	 * @param {string} message - Logging message
	 */
	warn: (message: string) =>
		logFunction({
			namespace,
			category,
			logLevel: 'WARN',
			message,
		}),
	/**
	 * Records an ERROR level log event.
	 *
	 * @param {string} message - Logging message
	 **/
	error: (message: string) =>
		logFunction({
			namespace,
			category,
			logLevel: 'ERROR',
			message,
		}),
	/**
	 * Records a general log event.
	 *
	 * @param {string} message - Logging message
	 * @param {LogLevel} level - Logging level, optional defaults to 'INFO'
	 */
	log: (message: string, logLevel: LogLevel = 'INFO') =>
		logFunction({
			namespace,
			category,
			logLevel,
			message,
		}),
});
