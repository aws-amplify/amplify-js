// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CreateLoggerInput, CreateLoggerOutput, Logger } from './types';
import { createBaseLogger } from './utils/createBaseLogger';
import { dispatchLogsToProviders } from './dispatchLogsToProviders';

/**
 * Generates a new Logger which can be used to record log events for the specified namespace and category.
 *
 * @param input - The {@link CreateLoggerInput} object containing the namespace and an optional category name.
 * @returns A {@link Logger} object which can be used to record log events.
 */
export const createLogger = (input: CreateLoggerInput): CreateLoggerOutput =>
	createBaseLogger(input, dispatchLogsToProviders);
