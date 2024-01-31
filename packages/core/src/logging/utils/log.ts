// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from '../types';

export const logLevelIndex = [
	'VERBOSE',
	'DEBUG',
	'INFO',
	'WARN',
	'ERROR',
	'NONE',
];

/**
 * Checks if a given input log level is equal to or higher than the current log level.
 */
export const isWithinCurrentLogLevel = (
	inputLevel: LogLevel,
	currentLevel: LogLevel
): boolean => {
	if (!logLevelIndex.includes(currentLevel)) return false;
	return (
		logLevelIndex.indexOf(inputLevel) >= logLevelIndex.indexOf(currentLevel)
	);
};
