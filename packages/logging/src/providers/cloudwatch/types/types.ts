// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: fix import
import {
	LogLevel,
	LogParams,
	LoggingCategory,
	LoggingProvider,
} from '@aws-amplify/core/internals/utils';

export interface CloudWatchProvider extends LoggingProvider {
	// TODO: configure method needs another param case handled options?: CloudWatchRemoteLoggingConstraints
	configure(config: CloudWatchConfig): void;
	log(logParams: LogParams): void;
	flushLogs(): Promise<void>;
	enable(): void;
	disable(): void;
}

export interface CloudWatchConfig {
	enable?: boolean;
	logGroupName: string;
	region: string;
	localStoreMaxSizeInMB?: number;
	flushIntervalInSeconds?: number;
	defaultRemoteConfiguration?: RemoteConfiguration;
	loggingConstraints?: LoggingConstraints;
}

interface RemoteConfiguration {
	endpoint: string;
	refreshIntervalInSeconds?: number;
}

export interface LoggingConstraint {
	defaultLogLevel: LogLevel;
	categoryLogLevel?: CategoryLogLevel;
}

export interface LoggingConstraints extends LoggingConstraint {
	userLogLevel?: Record<string, LoggingConstraint>;
}

export type CategoryLogLevel = {
	[Category in LoggingCategory]?: LogLevel;
};

interface CloudWatchRemoteLoggingConstraints {
	fetchLoggingConstraints(): Promise<LoggingConstraints>;
	getIntervalInSeconds(): number;
}
