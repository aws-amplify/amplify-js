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
	let fcn = console.log.bind(console);
	switch (logLevel) {
		case 'ERROR': {
			fcn = console.error?.bind(console) ?? fcn;
			break;
		}
		case 'WARN': {
			fcn = console.warn?.bind(console) ?? fcn;
			break;
		}
		case 'INFO': {
			fcn = console.info?.bind(console) ?? fcn;
			break;
		}
		case 'VERBOSE':
		case 'DEBUG': {
			fcn = console.debug?.bind(console) ?? fcn;
			break;
		}
	}
	return fcn;
};
