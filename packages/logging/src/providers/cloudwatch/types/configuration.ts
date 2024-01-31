// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface ProviderConfiguration {
	enable: boolean;
	logGroupName: string;
	region: string;
	localStoreMaxSizeInMB: number;
	flushIntervalInSeconds: number;
	defaultRemoteConfiguration: RemoteConfiguration;
	loggingConstraints: LoggingConstraints;
}

export interface RemoteConfiguration {
	endpoint: string;
	refreshIntervalInSeconds: number;
}

export interface LoggingConstraints extends LogLevelConfiguration {
	userLogLevel?: Record<string, LogLevelConfiguration>;
}

interface LogLevelConfiguration {
	defaultLogLevel: string;
	categoryLogLevel: {
		API: string;
		AUTH: string;
	};
}
