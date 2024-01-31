// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface CloudWatchConfiguration {
	enable?: boolean;
	logGroupName: string;
	region: string;
	localStoreMaxSizeInMB?: number;
	flushIntervalInSeconds?: number;
	defaultRemoteConfiguration?: RemoteConfiguration;
	loggingConstraints?: LoggingConstraints;
}

export type FetchRemoteLoggingConstraints = (
	endpoint: string
) => Promise<LoggingConstraints>;

export interface RemoteConfiguration {
	endpoint: string;
	refreshIntervalInSeconds?: number;
}

export interface RemoteLoggingConstraintsRefreshConfiguration
	extends RemoteConfiguration {
	fetchRemoteLoggingConstraints?: FetchRemoteLoggingConstraints;
}

export interface LoggingConstraints extends LogLevelConfiguration {
	userLogLevel?: Record<string, LogLevelConfiguration>;
}

interface LogLevelConfiguration {
	defaultLogLevel: string;
	categoryLogLevel?: Record<string, string>;
}
