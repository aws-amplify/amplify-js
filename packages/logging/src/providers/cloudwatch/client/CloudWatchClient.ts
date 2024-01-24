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
import {
	fetchAuthSession,
	createQueuedStorage,
	QueuedStorage,
} from '@aws-amplify/core';
import { QueuedItem } from '@aws-amplify/core/dist/esm/utils/queuedStorage/types';
import { getDeviceId } from '@aws-amplify/core/internals/utils';
import { AwsCredentialIdentity } from '@aws-sdk/types/dist-types/identity/AwsCredentialIdentity';

export const DEFAULT_LOG_LEVEL: LogLevel = 'INFO';
const GUEST_USER_ID_FOR_LOG_STREAM_NAME: string = 'INFO';
let cloudWatchConfig: CloudWatchConfig;
let queuedStorage: QueuedStorage;
let cloudWatchSDKClient: CloudWatchLogsClient;
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
		queuedStorage = createQueuedStorage();
		let session;
		try {
			session = await fetchAuthSession();
		} catch (error) {
			return Promise.reject('No credentials');
		}
		const { region } = cloudWatchConfig;

		// TODO: update this client when credentials change
		cloudWatchSDKClient = new CloudWatchLogsClient({
			region,
			credentials: _changeAwareCredentialsProvider,
		});
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
				// TODO: Determine the format of the timestamp
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
		const messages = await queuedStorage.peekAll();
		console.log('messsages from storage: ', messages);
		await _sendToCloudWatch(convertBufferLogsToCWLogs(messages));
		// TODO(ashwinkumar6): pending impl
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
	try {
		const { logGroupName } = cloudWatchConfig;
		// TODO: Decide how cx can give their own logStreamName
		const logStreamName = await _getDefaultStreamName();
		const logBatch: PutLogEventsCommandInput = {
			logEvents: messages,
			logGroupName,
			logStreamName,
		};
		if (sdkClientConstraintsSatisfied(logBatch)) {
			// TODO: Add connectivity monitor to try when the device is online
			await cloudWatchSDKClient.send(new PutLogEventsCommand(logBatch));
			// TODO: retry with failed logs
		}
	} catch (error) {
		// TODO: Handle errors and retrying if possible
		console.error('Error putting log events:', error);
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

async function _getDefaultStreamName() {
	let session;
	try {
		session = await fetchAuthSession();
	} catch (error) {
		return Promise.reject('No credentials');
	}
	const userId = session.userSub ?? GUEST_USER_ID_FOR_LOG_STREAM_NAME;
	const deviceId = await getDeviceId();
	const dateNow = new Date().toISOString().split('T')[0];
	return `${dateNow}.${deviceId}.${userId}`;
}

async function _changeAwareCredentialsProvider(): Promise<AwsCredentialIdentity> {
	let session;
	try {
		session = await fetchAuthSession();
	} catch (error) {
		return Promise.reject('Error fetching session');
	}
	if (session.credentials) {
		return session.credentials;
	} else {
		return Promise.reject('No credentials');
	}
}
