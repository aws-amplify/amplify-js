// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggingProvider } from '../../types';

export interface ConsoleProvider extends LoggingProvider {
	LOG_LEVEL: string | null;
	initialize(config: ConsoleConfig): void;
}

export interface ConsoleConfig {
	enable?: boolean;
	defaultLogLevel: LogLevel;
}
