// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggerCategory } from '../types';

export type LogLevel = 'DEBUG' | 'ERROR' | 'INFO' | 'WARN' | 'VERBOSE' | 'NONE';

export type LogParams = {
	namespace: string;
	logLevel: LogLevel;
	message: string;
	category?: LoggerCategory;
};

export interface LoggerProvider {
	log: (logParams: LogParams) => void;
	flushLogs: () => Promise<void>;
}

export interface Logger {
	verbose: (message: string) => void;
	debug: (message: string) => void;
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
	log: (message: string, level?: LogLevel) => void;
}

type GenerateLoggerInput = {
	namespace: string;
	category?: LoggerCategory;
};
export type GenerateLogger = (input: GenerateLoggerInput) => Logger;
