// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggerProvider } from '../../types';

export interface ConsoleProvider extends LoggerProvider {
	get LOG_LEVEL(): string | null;
	set LOG_LEVEL(level: string | null);
	initialize: (config: ConsoleConfig) => void;
}

export type ConsoleConfig = {
	enable: boolean;
	defaultLogLevel: LogLevel;
};
