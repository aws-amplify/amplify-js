// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel } from '../types';

const logLevelIndex = ['VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];

export const checkLogLevel = (
	inputLevel: LogLevel,
	currentLevel: LogLevel
): boolean => {
	return (
		logLevelIndex.indexOf(inputLevel) >= logLevelIndex.indexOf(currentLevel)
	);
};
