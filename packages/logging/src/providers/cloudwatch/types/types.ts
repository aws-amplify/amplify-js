// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggingCategory, LoggingProvider } from '../../../types';

export interface CloudWatchProvider extends LoggingProvider {
	configure: (
		config: CloudWatchConfig,
		options?: CloudWatchRemoteLoggingConstraints
	) => void;
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

interface LoggingConstraints {
	defaultLogLevel: LogLevel;
	categoryLogLevel?: CategoryLogLevel;
	userLogLevel?: {
		[Usersub: string]: {
			defaultLogLevel: LogLevel;
			categoryLogLevel: CategoryLogLevel;
		};
	};
}

type CategoryLogLevel = {
	[Category in LoggingCategory]?: LogLevel;
};

interface CloudWatchRemoteLoggingConstraints {
	fetchLoggingConstraints: () => Promise<LoggingConstraints>;
	getIntervalInSeconds: () => number;
}
