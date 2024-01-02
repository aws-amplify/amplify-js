// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggerProvider } from '../../types';

export interface ConsoleProvider extends LoggerProvider {
	LOG_LEVEL: string | null;
	initialize(config: ConsoleConfig): void;
}

export interface ConsoleConfig {
	enable?: boolean;
	defaultLogLevel: LogLevel;
}
