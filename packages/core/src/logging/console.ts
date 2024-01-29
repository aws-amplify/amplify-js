// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogParams } from './types';
import {
	getTimestamp,
	checkLogLevel,
	getConsoleLogLevel,
	getConsoleLogFunction,
} from './utils';

/**
 * Logs a given message to the console.
 **/
export const logToConsole = ({
	namespace,
	category,
	logLevel,
	message,
}: LogParams) => {
	const logFunction = getConsoleLogFunction(logLevel);
	const categoryPrefix = category ? `/${category}` : '';
	const prefix = `[${logLevel}] ${getTimestamp()} ${namespace}${categoryPrefix}`;
	if (checkLogLevel(logLevel, getConsoleLogLevel()))
		logFunction(prefix, message);
};
