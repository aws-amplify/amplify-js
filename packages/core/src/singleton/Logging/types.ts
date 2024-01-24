// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingProvider } from '../../logging/types';
import { ConsoleProvider } from '../../logging/console';

export interface LibraryLoggingOptions {
	console?: ConsoleProvider;
	additionalProviders?: LoggingProvider[];
}
