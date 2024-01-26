// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): PENDING complete implementation of cloudWatchProvider
import {
	CloudWatchLogsClient,
	InputLogEvent,
	PutLogEventsCommand,
	PutLogEventsCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';
import { LogLevel, LogParams } from '../../../types';
import { CloudWatchConfig, CloudWatchProvider } from '../types';
import { createQueuedStorage, QueuedStorage } from '@aws-amplify/core';
import { QueuedItem } from '@aws-amplify/core/dist/esm/utils/queuedStorage/types';
import { NetworkConnectionMonitor } from '@aws-amplify/core/internals/utils';
import { getDefaultStreamName } from '../utils';
import { resolveCredentials } from '../../../utils/resolveCredentials';

const DEFAULT_LOG_LEVEL: LogLevel = 'INFO';

let cloudWatchConfig: CloudWatchConfig;
let queuedStorage: QueuedStorage;
let cloudWatchSDKClient: CloudWatchLogsClient;
let networkMonitor: NetworkConnectionMonitor;

const defaultConfig = {
	enable: true,
	localStoreMaxSizeInMB: 5,
	flushIntervalInSeconds: 60,
	loggingConstraints: {
		defaultLogLevel: DEFAULT_LOG_LEVEL,
	},
};
// TODO: Needs a syncing module to chek and flushLogs
export const cloudWatchProvider: CloudWatchProvider = {
	/**
	 * set the initial configuration
	 * @internal
	 */
	configure: async (config: CloudWatchConfig) => {
		// TODO(ashwinkumar6): rename 'initialize' to 'configure'. Allow configuring multiple times
		// TODO(ashwinkumar6): create and use LoggingError
		// TODO(ashwinkumar6): fix merge logic, support nested
		cloudWatchConfig = { ...defaultConfig, ...config };
		const { region } = cloudWatchConfig;

		// TODO: update this client when credentials change
		cloudWatchSDKClient = new CloudWatchLogsClient({
			region,
			credentials: resolveCredentials,
		});

		queuedStorage = createQueuedStorage();
		networkMonitor = new NetworkConnectionMonitor();
		// TODO: start a timer for flushIntervalInSeconds and start the sync to CW -- call startSyncIfNotInProgress
	},
	/**
	 * logs are enqueued to local store and persisted
	 * logs are periodically flushed from store and send to CloudWatch
	 * @internal
	 */
	log: (input: LogParams) => {
		if (!_isLoggable(input)) {
			return;
		}
		const { namespace, category, logLevel, message } = input;
		const categoryPrefix = category ? `/${category}` : '';
		const prefix = `[${logLevel}] ${namespace}${categoryPrefix}`;
		const content = `${prefix}: ${message}`;

		// Store log with log rotation enabled if it's full
		queuedStorage.add(
			{
				content,
				timestamp: new Date().getTime().toString(),
			},
			{
				dequeueBeforeEnqueue: queuedStorage.isFull(
					cloudWatchConfig.localStoreMaxSizeInMB ??
						defaultConfig.localStoreMaxSizeInMB
				),
			}
		);
		// TODO: call startSyncIfNotInProgress
		console.log('Done logging the event');
	},

	// TODO: Need a module to tie log and flushLogs together. log -> storage -> buffer -> flushLogs
	// EX: startSyncIfNotInProgress

	/**
	 * send locally persisted logs to CloudWatch on demand
	 * @internal
	 */
	flushLogs: async (): Promise<void> => {
		// TODO: Get these messages from buffer and not storage
		const messages = await queuedStorage.peekAll();
		await _sendToCloudWatch(convertBufferLogsToCWLogs(messages));
		return Promise.resolve();
	},
	/**
	 * enable cloudwatch provider
	 * @internal
	 */
	enable: (): void => {
		cloudWatchConfig.enable = true;
	},
	/**
	 * disable cloudwatch provider
	 * @internal
	 */
	disable: (): void => {
		cloudWatchConfig.enable = false;
	},
};

async function _sendToCloudWatch(messages: InputLogEvent[]) {
	const { logGroupName } = cloudWatchConfig;
	// TODO: Decide how cx can give their own logStreamName
	const logStreamName = await getDefaultStreamName();
	const logBatch: PutLogEventsCommandInput = {
		logEvents: messages,
		logGroupName,
		logStreamName,
	};
	if (sdkClientConstraintsSatisfied(logBatch)) {
		networkMonitor.enableNetworkMonitoringFor(async () => {
			await cloudWatchSDKClient.send(new PutLogEventsCommand(logBatch));
		});
		// TODO: retry with failed logs
	}
}

function _isLoggable(log: LogParams): boolean {
	// TODO: Log filtering function
	return true;
}

// TODO: Add the constraints for log batches based on sdk API
// https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
function sdkClientConstraintsSatisfied(
	logBatch: PutLogEventsCommandInput
): Boolean {
	return true;
}

// TODO: Input should be buffered logs type not QueuedItem from storage
function convertBufferLogsToCWLogs(
	bufferedLogs: QueuedItem[]
): InputLogEvent[] {
	return bufferedLogs.map(bufferedLog => {
		return {
			message: bufferedLog.content,
			timestamp: Date.parse(bufferedLog.timestamp),
		};
	});
}
