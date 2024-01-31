// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from '../types';

let logLevel: LogLevel = 'WARN';

/**
 * Set the current console log level.
 */
export const setConsoleLogLevel = (level: LogLevel) => {
	logLevel = level;
};

/**
 * Returns the current console log level.
 */
export const getConsoleLogLevel = (): LogLevel => logLevel;

/**
 * Returns a function to write logs onto the console.
 */
export const getConsoleLogFunction = (logLevel: LogLevel) => {
	let logFunction = console.log.bind(console);
	switch (logLevel) {
		case 'ERROR': {
			logFunction = console.error?.bind(console) ?? logFunction;
			break;
		}
		case 'WARN': {
			logFunction = console.warn?.bind(console) ?? logFunction;
			break;
		}
		case 'INFO': {
			logFunction = console.info?.bind(console) ?? logFunction;
			break;
		}
		case 'VERBOSE':
		case 'DEBUG': {
			logFunction = console.debug?.bind(console) ?? logFunction;
			break;
		}
	}
	return logFunction;
};
