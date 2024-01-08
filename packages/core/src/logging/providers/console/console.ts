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
	 * apply the global LOG_LEVEL override from legacy ConsoleLogger to the consoleProvider
	 * ensure backwards compatibility
	 * @internal
	 * @deprecated
	 */
	get LOG_LEVEL(): LogLevel {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		return consoleConfig.defaultLogLevel;
	},
	/**
	 * apply the global LOG_LEVEL override from legacy ConsoleLogger to the consoleProvider
	 * ensure backwards compatibility
	 * @internal
	 * @deprecated
	 */
	set LOG_LEVEL(level: LogLevel) {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		consoleConfig.defaultLogLevel = level;
	},
	/**
	 * set the initial configuration
	 * @internal
	 */
	initialize: (config: ConsoleConfig = defaultConfig) => {
		// TODO(ashwinkumar6): rename 'initialize' to 'configure'. Allow configuring multiple times
		// TODO(ashwinkumar6): create and use LoggerError
		consoleConfig = config;
	},
	/**
	 * send logs to console
	 * @internal
	 */
	log: (input: LogParams) => {
		if (!consoleConfig) consoleProvider.initialize(defaultConfig);
		const { namespace, category, logLevel, message } = input;
		const logFcn = getConsoleLogFcn(logLevel);
		const categoryPrefix = category ? `/${category}` : '';
		const prefix = `[${logLevel}] ${getTimestamp()} ${namespace}${categoryPrefix}`;
		if (checkLogLevel(logLevel, consoleConfig.defaultLogLevel))
			logFcn(prefix, message);
	},
	/**
	 * console provider logs events right away. Flushing logs isn't required
	 * performs no operation
	 * @internal
	 */
	flushLogs: (): Promise<void> => {
		return Promise.resolve();
	},
	/**
	 * enable console provider
	 * @internal
	 */
	enable: (): void => {
		consoleConfig.enable = true;
	},
	/**
	 * disable console provider
	 * @internal
	 */
	disable: (): void => {
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
