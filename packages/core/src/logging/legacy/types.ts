// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
 * ---------------------------------------------------------------------------------
 * LEGACY CONSOLE LOGGER CLASS TYPES
 * ---------------------------------------------------------------------------------
 *
 * Context:
 * The 'ConsoleLogger' class is a legacy component in this codebase.
 * It has been superseded by a new console logging utility.
 * While 'ConsoleLogger' remains functional and supported for the time being,
 * it is scheduled for deprecation.
 *
 * Future:
 * This class is marked for deprecation and will be removed in the next major
 * version.
 *
 * Note to Maintainers:
 * Please ensure that any updates or bug fixes to 'ConsoleLogger' during its
 * deprecation period are critical and necessary.
 * ---------------------------------------------------------------------------------
 */

/**
 * Taken from @aws-sdk/client-cloudwatch-logs@3.6.1
 */
export interface InputLogEvent {
	timestamp: number | undefined;
	message: string | undefined;
}

export interface LoggingProvider {
	// return the name of you provider
	getProviderName(): string;

	// return the name of you category
	getCategoryName(): string;

	// configure the plugin
	configure(config?: object): object;

	// take logs and push to provider
	pushLogs(logs: InputLogEvent[]): void;
}

export interface Logger {
	debug(msg: string): void;
	info(msg: string): void;
	warn(msg: string): void;
	error(msg: string): void;
	addPluggable(pluggable: LoggingProvider): void;
}

export enum LogType {
	DEBUG = 'DEBUG',
	ERROR = 'ERROR',
	INFO = 'INFO',
	WARN = 'WARN',
	VERBOSE = 'VERBOSE',
}
