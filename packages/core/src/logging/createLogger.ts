// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CreateLogger } from './types';
import { Logger } from './logger';

/**
 * Generates a new Logger which can be used to record log events for the specified namespace and category.
 *
 * @param input - The {@link CreateLoggerInput} object containing the namespace and an optional category name.
 * @returns Output containing the {@link CreateLoggerOutput} object.
 */
export const createLogger: CreateLogger = ({ namespace, category }) =>
	new Logger(namespace, category);
