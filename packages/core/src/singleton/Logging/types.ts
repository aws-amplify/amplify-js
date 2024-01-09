// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerProvider } from '../../logging/types';
import { ConsoleProvider } from '../../logging/providers/console';

export interface LibraryLoggingOptions {
	console?: ConsoleProvider;
	additionalProviders?: LoggerProvider[];
}
