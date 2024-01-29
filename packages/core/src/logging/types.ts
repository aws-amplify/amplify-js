// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type LoggingCategory =
	| 'Analytics'
	| 'API'
	| 'Auth'
	| 'DataStore'
	| 'Geo'
	| 'Hub'
	| 'Logging'
	| 'Predictions'
	| 'PushNotifications'
	| 'Storage';

export type LogLevel = 'NONE' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'VERBOSE';

export interface LogParams {
	namespace: string;
	logLevel: LogLevel;
	message: string;
	category?: LoggingCategory;
}

export interface LoggingProvider {
	log: (logParams: LogParams) => void;
}

export interface LoggerType {
	verbose: (message: string) => void;
	debug: (message: string) => void;
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
	log: (message: string, level?: LogLevel) => void;
}

export interface CreateLogger {
	(input: { namespace: string; category?: LoggingCategory }): LoggerType;
}
