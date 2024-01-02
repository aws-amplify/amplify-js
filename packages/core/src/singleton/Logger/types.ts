// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerProvider } from '../../Logger/types';
import { ConsoleProvider } from '../../Logger/providers/console';

export interface LibraryLoggerOptions {
	console?: ConsoleProvider;
	additionalProviders?: LoggerProvider[];
}
