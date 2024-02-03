// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): PENDING complete implementation of cloudWatchProvider
import {
	CloudWatchLogsClient,
	InputLogEvent,
	PutLogEventsCommand,
	PutLogEventsCommandInput,
	RejectedLogEventsInfo,
} from '@aws-sdk/client-cloudwatch-logs';
import { CloudWatchConfig, CloudWatchProvider } from '../types';
import {
	NetworkConnectionMonitor,
	createQueuedStorage,
	QueuedStorage,
	QueuedItem,
} from '@aws-amplify/core/internals/utils';
import { getDefaultStreamName } from '../utils';
import { resolveCredentials } from '../../../utils/resolveCredentials';
import {
	LogLevel,
	LogParams,
	LoggingProvider,
} from '@aws-amplify/core/internals/logging';

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

export const cloudWatchProvider: LoggingProvider = {
	/**
	 * set the initial configuration
	 * @internal
	 */
	configure: async (config: CloudWatchConfig) => {
		cloudWatchConfig = { ...defaultConfig, ...config };
		const { region } = cloudWatchConfig;

		// TODO: Test credentials change
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

		// Final log format looks like this: `[${logLevel}] ${namespace}/${category}: ${message}`
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
	},

	// TODO: Need a module to tie log and flushLogs together. log -> storage -> buffer -> flushLogs
	// EX: startSyncIfNotInProgress

	/**
	 * send locally persisted logs to CloudWatch on demand
	 * @internal
	 */
	flushLogs: async (): Promise<void> => {
		// TODO: Get these messages from buffer and not storage
		const batchedLogs = await queuedStorage.peekAll();
		await _sendToCloudWatch(batchedLogs);
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

async function _sendToCloudWatch(batchedLogs: QueuedItem[]) {
	const { logGroupName } = cloudWatchConfig;
	// TODO: how can cx give their own logStreamName?
	const logStreamName = await getDefaultStreamName();
	const logBatch: PutLogEventsCommandInput = {
		logEvents: convertBufferLogsToCWLogs(batchedLogs),
		logGroupName,
		logStreamName,
	};
	if (sdkClientConstraintsSatisfied(logBatch)) {
		networkMonitor.enableNetworkMonitoringFor(async () => {
			let rejectedLogEventsInfo;
			try {
				rejectedLogEventsInfo = (
					await cloudWatchSDKClient.send(new PutLogEventsCommand(logBatch))
				).rejectedLogEventsInfo;
				await handleRejectedLogEvents(batchedLogs, rejectedLogEventsInfo);
			} catch (e) {
				// TODO: Should we log to console or dispatch a hub event?
			}
		});
	}
}

// Exporting this function for testing purposes
export async function handleRejectedLogEvents(
	batchedLogs: QueuedItem[],
	rejectedLogEventsInfo?: RejectedLogEventsInfo
) {
	// If there is tooNewLogEvents delete every log until then
	if (rejectedLogEventsInfo?.tooNewLogEventStartIndex) {
		await queuedStorage.delete(
			batchedLogs.slice(rejectedLogEventsInfo.tooNewLogEventStartIndex)
		);
		// If there is no tooNewLogEvents then others are either tooOld, expired or successfully logged so delete them from storage
	} else {
		await queuedStorage.delete(batchedLogs);
		return;
	}

	// TODO:
	// 1. Needs design clarification on how to handle tooNewLogEventStartIndex -- For now following the Android impl of keeping them in local memory(cache).
	// 2. Retry logic for the same needs to be implemented
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
