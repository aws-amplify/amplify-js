// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerProvider } from '../../logger/types';
import { ConsoleProvider } from '../../logger/providers/console';

export interface LibraryLoggerOptions {
	console?: ConsoleProvider;
	additionalProviders?: LoggerProvider[];
}
