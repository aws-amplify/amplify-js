// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogLevel, LoggerProvider } from '../../types';
import { AmplifyLoggingCategory } from '../../../types';

export interface CloudWatchProvider extends LoggerProvider {
	initialize: (config: CloudWatchConfig) => void;
}

export type CloudWatchConfig = {
	enable?: boolean;
	logGroupName: string;
	region: string;
	localStoreMaxSizeInMB?: number;
	flushIntervalInSeconds?: number;
	defaultRemoteConfiguration?: RemoteConfiguration;
	loggingConstraints?: LoggingConstraints;
};

type RemoteConfiguration = {
	endpoint: string;
	refreshIntervalInSeconds: number;
};

type LoggingConstraints = {
	defaultLogLevel: LogLevel;
	categoryLogLevel?: CategoryLogLevel;
	userLogLevel?: {
		[Usersub: string]: {
			defaultLogLevel: LogLevel;
			categoryLogLevel: CategoryLogLevel;
		};
	};
};

type CategoryLogLevel = {
	[Category in AmplifyLoggingCategory]?: LogLevel;
};
