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
import { AWSCloudWatchProviderOptions, LoggingProvider } from '../types/types';
import { Credentials } from '../..';
import { ConsoleLogger as Logger } from '../Logger';
import { getAmplifyUserAgent } from '../Platform';
import { parseMobileHubConfig } from '../Parser';

const logger = new Logger('AWSCloudWatch');

class AWSCloudWatchProvider implements LoggingProvider {
	static PROVIDER_NAME = 'CloudWatch';
	static CATEGORY = 'Logging';

	private _config;

	constructor(config?: AWSCloudWatchProviderOptions) {
		this.configure(config);
	}

	public getProviderName(): string {
		return AWSCloudWatchProvider.PROVIDER_NAME;
	}

	public getCategoryName(): string {
		return AWSCloudWatchProvider.CATEGORY;
	}

	public configure(
		config?: AWSCloudWatchProviderOptions
	): AWSCloudWatchProviderOptions {
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
	): Promise<CreateLogGroupCommandOutput | string> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			logger.error('No credentials');
			throw Error;
		}

		logger.debug(
			'creating new log group in CloudWatch - ',
			params.logGroupName
		);
		const cmd = new CreateLogGroupCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
		}
	}

	public async getLogGroups(
		params: DescribeLogGroupsCommandInput
	): Promise<DescribeLogGroupsCommandOutput | string> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject<string>('No credentials');
		}

		logger.debug('getting list of log groups');

		const cmd = new DescribeLogGroupsCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
		}
	}

	public async createLogStream(
		params: CreateLogStreamCommandInput
	): Promise<CreateLogStreamCommandOutput | string> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject<string>('No credentials');
		}

		logger.debug(
			'creating new log stream in CloudWatch - ',
			params.logStreamName
		);
		const cmd = new CreateLogStreamCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
		}
	}

	public async getLogStreams(
		params: DescribeLogStreamsCommandInput
	): Promise<DescribeLogStreamsCommandOutput | string> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject<string>('No credentials');
		}

		logger.debug('getting list of log streams');
		const cmd = new DescribeLogStreamsCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
		}
	}

	public async getLogEvents(
		params: GetLogEventsCommandInput
	): Promise<GetLogEventsCommandOutput | string> {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject<string>('No credentials');
		}

		logger.debug('getting log events from stream - ', params.logStreamName);
		const cmd = new GetLogEventsCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
		}
	}

	public async pushLogs(
		logs: InputLogEvent[]
	): Promise<PutLogEventsCommandOutput | string> {
		const { logStreamName, logGroupName } = this._config;
		const req: PutLogEventsCommandInput = {
			logEvents: logs,
			logGroupName,
			logStreamName,
		};

		try {
			// Check if log group exists and create if it doesn't
			logger.debug(`checking if log group ${logGroupName} exists.`);
			const existingGroup = await this._validateLogGroupExists(logGroupName);
			if (!existingGroup) {
				logger.debug(
					`specified log group not found. creating log group ${logGroupName}`
				);
				await this.createLogGroup({ logGroupName });
			}

			// Check if log stream exists and create if it doesn't
			logger.debug(
				`checking if specified log stream ${logStreamName} exists...`
			);
			const existingStream = await this._validateLogStreamExists(
				logGroupName,
				logStreamName
			);

			// If a stream already exists, we need to grab the next sequence token
			if (existingStream && typeof existingStream !== 'string') {
				req.sequenceToken = existingStream.uploadSequenceToken;
			} else {
				await this.createLogStream({
					logGroupName: logGroupName,
					logStreamName: logStreamName,
				});
				logger.debug(
					`specified log stream not found. creating log stream ${logStreamName}`
				);
			}

			// Push logs to Cloudwatch
			logger.debug('pushing log events to Cloudwatch...');
			const output = await this._sendLogEvents(req);

			return output;
		} catch (err) {
			const errString = `Error occurred while pushing logs. Error - ${err}`;

			return Promise.reject<string>(errString);
		}
	}

	private async _validateLogGroupExists(
		logGroupName: string
	): Promise<LogGroup | string> {
		try {
			const currGroups = await this.getLogGroups({
				logGroupNamePrefix: logGroupName,
			});

			if (!(typeof currGroups === 'string') && currGroups.logGroups) {
				const foundGroups = currGroups.logGroups.filter(
					group => group.logGroupName === logGroupName
				);
				if (foundGroups.length > 0) {
					return foundGroups[0];
				}
			}

			return null;
		} catch (err) {
			const errString = `failure during log group search: ${err}`;

			return Promise.reject<string>(errString);
		}
	}

	private async _validateLogStreamExists(
		logGroupName: string,
		logStreamName: string
	): Promise<LogStream | string> {
		try {
			const currStreams = await this.getLogStreams({
				logGroupName,
				logStreamNamePrefix: logStreamName,
			});

			if (!(typeof currStreams === 'string') && currStreams.logStreams) {
				const foundStreams = currStreams.logStreams.filter(
					stream => stream.logStreamName === logStreamName
				);
				if (foundStreams.length > 0) {
					return foundStreams[0];
				}
			}

			return null;
		} catch (err) {
			const errString = `failure during log stream search: ${err}`;

			return Promise.reject<string>(errString);
		}
	}

	private async _sendLogEvents(
		params: PutLogEventsCommandInput
	): Promise<PutLogEventsCommandOutput | string> {
		try {
			const credentialsOK = await this._ensureCredentials();
			if (!credentialsOK) {
				return Promise.reject<string>('No credentials');
			}

			logger.debug('sending log events to stream - ', params.logStreamName);
			const cmd = new PutLogEventsCommand(params);
			const client = this._initCloudWatchLogs();
			const output = await client.send(cmd);

			return output;
		} catch (err) {
			const errString = `failure during log stream search: ${err}`;

			return Promise.reject<string>(errString);
		}
	}

	private _initCloudWatchLogs() {
		return new CloudWatchLogsClient({
			region: this._config.region,
			credentials: this._config.credentials,
			customUserAgent: getAmplifyUserAgent(),
			endpoint: this._config.endpoint,
			logger,
		});
	}

	private async _ensureCredentials() {
		return await Credentials.get()
			.then(credentials => {
				if (!credentials) return false;
				const cred = Credentials.shear(credentials);
				logger.debug('set credentials for storage', cred);
				this._config.credentials = cred;

				return true;
			})
			.catch(error => {
				logger.warn('ensure credentials error', error);
				return false;
			});
	}
}

export { AWSCloudWatchProvider };
