// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LogParams } from '../../types';
import { getTimestamp, checkLogLevel, DEFAULT_LOG_LEVEL } from '../../utils';
import { ConsoleConfig, ConsoleProvider } from './types';

let consoleConfig: ConsoleConfig;
const defaultConfig = {
	enable: true,
	defaultLogLevel: DEFAULT_LOG_LEVEL,
};

export const consoleProvider: ConsoleProvider = {
	/**
	 * @internal
	 */
	get LOG_LEVEL(): LogLevel {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		return consoleConfig.defaultLogLevel;
	},
	/**
	 * @internal
	 */
	set LOG_LEVEL(level: LogLevel) {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		consoleConfig.defaultLogLevel = level;
	},
	initialize: (config: ConsoleConfig = defaultConfig) => {
		if (consoleConfig) throw new Error('Console provider already initialised');
		consoleConfig = config;
	},
	log: (input: LogParams) => {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		const { namespace, logLevel, message } = input;
		const logFcn = getConsoleLogFcn(logLevel);
		const prefix = `[${logLevel}] ${getTimestamp()} ${namespace}`;
		if (checkLogLevel(logLevel, consoleConfig.defaultLogLevel))
			logFcn(prefix, message);
	},
	flushLogs: function (): Promise<void> {
		return Promise.resolve();
	},
	enable: function (): void {
		consoleConfig.enable = true;
	},
	disable: function (): void {
		consoleConfig.enable = false;
	},
};

const getConsoleLogFcn = (logLevel: LogLevel) => {
	let fcn = console.log.bind(console);
	switch (logLevel) {
		case 'DEBUG': {
			fcn = console.debug?.bind(console) ?? fcn;
			break;
		}
		case 'ERROR': {
			fcn = console.error?.bind(console) ?? fcn;
			break;
		}
		case 'INFO': {
			fcn = console.info?.bind(console) ?? fcn;
			break;
		}
		case 'WARN': {
			fcn = console.warn?.bind(console) ?? fcn;
			break;
		}
	}
	return fcn;
};
