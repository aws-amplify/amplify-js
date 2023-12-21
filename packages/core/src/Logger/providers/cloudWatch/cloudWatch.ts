// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// PENDING: complete implementation of cloudWatchProvider
import { fetchAuthSession } from '../../../index';
import { checkLogLevel, DEFAULT_LOG_LEVEL } from '../../utils';
import {
	CloudWatchLogsClient,
	PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { LogParams } from '../../types';
import { CloudWatchProvider, CloudWatchConfig } from './types';
// import { generateRandomString } from '@aws-amplify/core/internals/utils';

let cloudWatchConfig: CloudWatchConfig;
const defaultConfig = {
	enable: true,
	localStoreMaxSizeInMB: 5,
	flushIntervalInSeconds: 60,
	loggingConstraints: {
		defaultLogLevel: DEFAULT_LOG_LEVEL,
	},
};

export const cloudWatchProvider: CloudWatchProvider = {
	initialize: (config: CloudWatchConfig) => {
		if (cloudWatchConfig)
			throw new Error('CloudWatch provider already initialised');
		cloudWatchConfig = { ...defaultConfig, ...config };
	},
	log: (input: LogParams) => {
		const { namespace, category, logLevel, message } = input;
		const categoryPrefix = category ? `/${category}` : '';
		const prefix = `[${logLevel}] ${namespace}${categoryPrefix}`;
		const currentLevel =
			cloudWatchConfig.loggingConstraints?.defaultLogLevel ?? DEFAULT_LOG_LEVEL;

		if (checkLogLevel(logLevel, currentLevel))
			putLogEvents(`${prefix} ${message}`);
	},
	flushLogs: function (): Promise<void> {
		return Promise.resolve(); // TODO
	},
};

async function putLogEvents(message: string) {
	try {
		const { logGroupName, region } = cloudWatchConfig;
		// TODO: {mm-dd-yyyy}.{deviceId}.{userId|guest}
		// const deviceId = generateRandomString(10);
		const logStreamName = 'central-logger-12-17-2023';
		const timestamp = new Date().getTime();

		let session;
		try {
			session = await fetchAuthSession();
		} catch (error) {
			return Promise.reject('No credentials');
		}
		const client = new CloudWatchLogsClient({
			region,
			credentials: session.credentials,
		});

		const params = {
			logEvents: [{ message, timestamp }],
			logGroupName,
			logStreamName,
		};

		await client.send(new PutLogEventsCommand(params));
	} catch (error) {
		console.error('Error putting log events:', error);
	}
}
