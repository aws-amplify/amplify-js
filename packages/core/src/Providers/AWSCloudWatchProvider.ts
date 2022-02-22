/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {
	CloudWatchLogsClient,
	CreateLogGroupCommand,
	CreateLogGroupCommandInput,
	CreateLogGroupCommandOutput,
	CreateLogStreamCommand,
	CreateLogStreamCommandInput,
	CreateLogStreamCommandOutput,
	DescribeLogGroupsCommand,
	DescribeLogGroupsCommandInput,
	DescribeLogGroupsCommandOutput,
	DescribeLogStreamsCommand,
	DescribeLogStreamsCommandInput,
	DescribeLogStreamsCommandOutput,
	GetLogEventsCommand,
	GetLogEventsCommandInput,
	GetLogEventsCommandOutput,
	InputLogEvent,
	LogGroup,
	LogStream,
	PutLogEventsCommand,
	PutLogEventsCommandInput,
	PutLogEventsCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import {
	AWSCloudWatchProviderOptions,
	CloudWatchDataTracker,
	LoggingProvider,
	AmplifyConfigure,
} from '../types/types';
import { Credentials } from '../..';
import { ConsoleLogger as Logger } from '../Logger';
import { getAmplifyUserAgent } from '../Platform';
import { parseMobileHubConfig } from '../Parser';
import {
	AWS_CLOUDWATCH_BASE_BUFFER_SIZE,
	AWS_CLOUDWATCH_CATEGORY,
	AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE,
	AWS_CLOUDWATCH_MAX_EVENT_SIZE,
	AWS_CLOUDWATCH_PROVIDER_NAME,
	NO_CREDS_ERROR_STRING,
	RETRY_ERROR_CODES,
} from '../Util/Constants';

if (
	typeof window === 'undefined' ||
	(typeof window === 'object' && !window.TextEncoder)
) {
	require('fast-text-encoding');
}

const logger = new Logger('AWSCloudWatch');
const INTERVAL = 10000;
class AWSCloudWatchProvider implements LoggingProvider {
	static readonly PROVIDER_NAME = AWS_CLOUDWATCH_PROVIDER_NAME;
	static readonly CATEGORY = AWS_CLOUDWATCH_CATEGORY;

	private _config: AWSCloudWatchProviderOptions;
	private _dataTracker: CloudWatchDataTracker;
	private _currentLogBatch: InputLogEvent[];
	private _timer;
	private _nextSequenceToken: string | undefined;
	private _processing: boolean;
	private _initialized = false;
	private _preFlightCheck: () => Promise<boolean>;

	constructor(config?: AmplifyConfigure) {
		console.log('cstr', config);
		if (!this._initialized) {
			this.configure(config);

			this._dataTracker = {
				eventUploadInProgress: false,
				logEvents: [],
				verifiedLogGroup: { logGroupName: this._config.logGroupName },
			};

			this._currentLogBatch = [];
			this._initiateLogPushInterval();
			this._initialized = true;
		}
	}

	public getProviderName(): string {
		return AWSCloudWatchProvider.PROVIDER_NAME;
	}

	public getCategoryName(): string {
		return AWSCloudWatchProvider.CATEGORY;
	}

	public getLogQueue(): InputLogEvent[] {
		return this._dataTracker.logEvents;
	}

	public setPreFlightCheck(cb): void {
		if (typeof cb === 'function') {
			this._preFlightCheck = cb;
		}
	}

	public configure(config?: AmplifyConfigure): AWSCloudWatchProviderOptions {
		if (!config) return this._config || {};

		const conf = Object.assign(
			{},
			this._config,
			parseMobileHubConfig(config).Logging,
			config
		);
		this._config = conf;

		return this._config;
	}

	public async createLogGroup(
		params: CreateLogGroupCommandInput
	): Promise<CreateLogGroupCommandOutput> {
		logger.debug(
			'creating new log group in CloudWatch - ',
			params.logGroupName
		);
		const cmd = new CreateLogGroupCommand(params);

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			logger.error(`error creating log group - ${error}`);
			throw error;
		}
	}

	public async getLogGroups(
		params: DescribeLogGroupsCommandInput
	): Promise<DescribeLogGroupsCommandOutput> {
		logger.debug('getting list of log groups');

		const cmd = new DescribeLogGroupsCommand(params);

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			logger.error(`error getting log group - ${error}`);
			throw error;
		}
	}

	public async createLogStream(
		params: CreateLogStreamCommandInput
	): Promise<CreateLogStreamCommandOutput> {
		logger.debug(
			'creating new log stream in CloudWatch - ',
			params.logStreamName
		);
		const cmd = new CreateLogStreamCommand(params);

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			logger.error(`error creating log stream - ${error}`);
			throw error;
		}
	}

	public async getLogStreams(
		params: DescribeLogStreamsCommandInput
	): Promise<DescribeLogStreamsCommandOutput> {
		logger.debug('getting list of log streams');
		const cmd = new DescribeLogStreamsCommand(params);

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			logger.error(`error getting log stream - ${error}`);
			throw error;
		}
	}

	public async getLogEvents(
		params: GetLogEventsCommandInput
	): Promise<GetLogEventsCommandOutput> {
		logger.debug('getting log events from stream - ', params.logStreamName);
		const cmd = new GetLogEventsCommand(params);

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			logger.error(`error getting log events - ${error}`);
			throw error;
		}
	}

	public pushLogs(logs: InputLogEvent[]): void {
		logger.debug('pushing log events to buffer');
		this._dataTracker.logEvents = this._dataTracker.logEvents.concat(logs);
	}

	public pause() {
		this._processing = false;
		if (this._timer) {
			clearInterval(this._timer);
		}
	}

	public resume() {
		this._processing = true;
		this._initiateLogPushInterval();
	}

	public clear() {
		this._dataTracker.logEvents = [];
		this._currentLogBatch = [];
	}

	private async _validateLogGroupExistsAndCreate(
		logGroupName: string
	): Promise<LogGroup> {
		if (this._dataTracker.verifiedLogGroup) {
			return this._dataTracker.verifiedLogGroup;
		}

		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const currGroups = await this.getLogGroups({
				logGroupNamePrefix: logGroupName,
			});

			if (!(typeof currGroups === 'string') && currGroups.logGroups) {
				const foundGroups = currGroups.logGroups.filter(
					group => group.logGroupName === logGroupName
				);
				if (foundGroups.length > 0) {
					this._dataTracker.verifiedLogGroup = foundGroups[0];

					return foundGroups[0];
				}
			}

			/**
			 * If we get to this point, it means that the specified log group does not exist
			 * and we should create it.
			 */
			await this.createLogGroup({ logGroupName });

			return null;
		} catch (err) {
			const errString = `failure during log group search: ${err}`;
			logger.error(errString);
			throw err;
		}
	}

	private async _validateLogStreamExists(
		logGroupName: string,
		logStreamName: string
	): Promise<LogStream> {
		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			const currStreams = await this.getLogStreams({
				logGroupName,
				logStreamNamePrefix: logStreamName,
			});

			if (currStreams.logStreams) {
				const foundStreams = currStreams.logStreams.filter(
					stream => stream.logStreamName === logStreamName
				);
				if (foundStreams.length > 0) {
					this._nextSequenceToken = foundStreams[0].uploadSequenceToken;

					return foundStreams[0];
				}
			}

			/**
			 * If we get to this point, it means that the specified stream does not
			 * exist, and we should create it now.
			 */
			await this.createLogStream({
				logGroupName,
				logStreamName,
			});

			return null;
		} catch (err) {
			const errString = `failure during log stream search: ${err}`;
			logger.error(errString);
			throw err;
		}
	}

	private async _sendLogEvents(
		params: PutLogEventsCommandInput
	): Promise<PutLogEventsCommandOutput> {
		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				throw new Error(NO_CREDS_ERROR_STRING);
			}

			logger.debug('sending log events to stream - ', params.logStreamName);
			const cmd = new PutLogEventsCommand(params);
			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);

			return output;
		} catch (err) {
			const errString = `failure during log push: ${err}`;
			logger.error(errString);
		}
	}

	private _initCloudWatchLogs() {
		return new CloudWatchLogsClient({
			region: this._config.region,
			credentials: this._config.credentials,
			customUserAgent: getAmplifyUserAgent(),
			endpoint: this._config.endpoint,
		});
	}

	private async _ensureCredentials() {
		return await Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for logging', cred);
				this._config.credentials = cred;

				return true;
			})
			.catch(error => {
				logger.warn('ensure credentials error', error);
				return false;
			});
	}

	private async _getNextSequenceToken(): Promise<string> {
		if (this._nextSequenceToken && this._nextSequenceToken.length > 0) {
			return this._nextSequenceToken;
		}

		/**
		 * A sequence token will not exist if any of the following are true:
		 *   ...the log group does not exist
		 *   ...the log stream does not exist
		 *   ...the log stream does exist but has no logs written to it yet
		 */
		try {
			await this._validateLogGroupExistsAndCreate(this._config.logGroupName);

			this._nextSequenceToken = undefined;

			const logStream = await this._validateLogStreamExists(
				this._config.logGroupName,
				this._config.logStreamName
			);

			if (logStream) {
				this._nextSequenceToken = logStream.uploadSequenceToken;
			}

			return this._nextSequenceToken;
		} catch (err) {
			logger.error(`failure while getting next sequence token: ${err}`);
			throw err;
		}
	}

	private async _safeUploadLogEvents(): Promise<PutLogEventsCommandOutput> {
		try {
			/**
			 * CloudWatch has restrictions on the size of the log events that get sent up.
			 * We need to track both the size of each event and the total size of the batch
			 * of logs.
			 *
			 * We also need to ensure that the logs in the batch are sorted in chronological order.
			 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
			 */
			if (!(await this._preFlightCheck())) {
				this.clear();
				return;
			}

			const seqToken = await this._getNextSequenceToken();
			const logBatch =
				this._currentLogBatch.length === 0
					? this._getBufferedBatchOfLogs()
					: this._currentLogBatch;

			const putLogsPayload: PutLogEventsCommandInput = {
				logGroupName: this._config.logGroupName,
				logStreamName: this._config.logStreamName,
				logEvents: logBatch,
				sequenceToken: seqToken,
			};

			this._dataTracker.eventUploadInProgress = true;
			const sendLogEventsResponse = await this._sendLogEvents(putLogsPayload);

			this._nextSequenceToken = sendLogEventsResponse.nextSequenceToken;
			this._dataTracker.eventUploadInProgress = false;
			this._currentLogBatch = [];

			return sendLogEventsResponse;
		} catch (err) {
			logger.error(`error during _safeUploadLogEvents: ${err}`);

			if (RETRY_ERROR_CODES.includes(err.name)) {
				this._getNewSequenceTokenAndSubmit({
					logEvents: this._currentLogBatch,
					logGroupName: this._config.logGroupName,
					logStreamName: this._config.logStreamName,
				});
			} else {
				this._dataTracker.eventUploadInProgress = false;
				throw err;
			}
		}
	}

	private truncateOversizedEvent(event) {
		const { timestamp, message } = event;
		let messageJson;
		try {
			messageJson = JSON.parse(message);

			const truncated = JSON.stringify({
				level: messageJson.level,
				class: messageJson.class,
				message: messageJson.message.substring(0, 500),
			});

			if (messageJson.data != null) {
				truncated[
					'data'
				] = `OBJECT SIZE EXCEEDS CLOUDWATCH EVENT LIMIT. Truncated: ${JSON.stringify(
					messageJson.data
				).substring(0, 500)}`;
			}

			return {
				timestamp,
				message: truncated,
			};
		} catch (error) {
			logger.warn('Could not minify oversized event', error);

			const truncated = JSON.stringify({
				level: 'UNKNOWN',
				class: 'Unknown',
				message:
					'OBJECT SIZE EXCEEDS CLOUDWATCH EVENT LIMIT. Could not parse event to truncate',
			});

			return {
				timestamp,
				message: truncated,
			};
		}
	}

	private _getBufferedBatchOfLogs(): InputLogEvent[] {
		/**
		 * CloudWatch has restrictions on the size of the log events that get sent up.
		 * We need to track both the size of each event and the total size of the batch
		 * of logs.
		 *
		 * We also need to ensure that the logs in the batch are sorted in chronological order.
		 * https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
		 */
		let currentEventIdx = 0;
		let totalByteSize = 0;

		while (currentEventIdx < this._dataTracker.logEvents.length) {
			let currentEvent = this._dataTracker.logEvents[currentEventIdx];

			let eventSize = currentEvent
				? new TextEncoder().encode(currentEvent.message).length +
				  AWS_CLOUDWATCH_BASE_BUFFER_SIZE
				: 0;

			if (eventSize > AWS_CLOUDWATCH_MAX_EVENT_SIZE) {
				const errString = `Log entry exceeds maximum size for CloudWatch logs. Log size: ${eventSize}. Truncating log message.`;
				logger.warn(errString);

				currentEvent = this.truncateOversizedEvent(currentEvent);
				this._dataTracker.logEvents[currentEventIdx] = currentEvent;

				eventSize =
					new TextEncoder().encode(currentEvent.message).length +
					AWS_CLOUDWATCH_BASE_BUFFER_SIZE;
			}

			if (totalByteSize + eventSize > AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE)
				break;

			totalByteSize += eventSize;
			currentEventIdx++;
		}

		this._currentLogBatch = this._dataTracker.logEvents.splice(
			0,
			currentEventIdx
		);

		return this._currentLogBatch;
	}

	private async _getNewSequenceTokenAndSubmit(
		payload: PutLogEventsCommandInput
	): Promise<PutLogEventsCommandOutput> {
		try {
			this._nextSequenceToken = undefined;
			this._dataTracker.eventUploadInProgress = true;

			const seqToken = await this._getNextSequenceToken();
			payload.sequenceToken = seqToken;
			const sendLogEventsRepsonse = await this._sendLogEvents(payload);

			this._dataTracker.eventUploadInProgress = false;
			this._currentLogBatch = [];

			return sendLogEventsRepsonse;
		} catch (err) {
			logger.error(
				`error when retrying log submission with new sequence token: ${err}`
			);
			this._dataTracker.eventUploadInProgress = false;

			throw err;
		}
	}

	private _initiateLogPushInterval(): void {
		if (this._timer) {
			clearInterval(this._timer);
		}

		this._timer = setInterval(async () => {
			try {
				if (this._getDocUploadPermissibility()) {
					await this._safeUploadLogEvents();
				}
			} catch (err) {
				logger.error(
					`error when calling _safeUploadLogEvents in the timer interval - ${err}`
				);
				this.pause();
			}
		}, INTERVAL);
	}

	private _getDocUploadPermissibility(): boolean {
		return (
			(this._dataTracker.logEvents.length !== 0 ||
				this._currentLogBatch.length !== 0) &&
			!this._dataTracker.eventUploadInProgress
		);
	}
}

export { AWSCloudWatchProvider };
