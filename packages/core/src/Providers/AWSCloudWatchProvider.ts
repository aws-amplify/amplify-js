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
	PutLogEventsCommand,
	PutLogEventsCommandInput,
	PutLogEventsCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import { LoggingProvider } from '../types/types';
import { Credentials } from '../..';
import { ConsoleLogger as Logger } from '../Logger';
import { getAmplifyUserAgent } from '../Platform';

const logger = new Logger('AWSCloudWatch');

export class AWSCloudWatchProvider implements LoggingProvider {
	static CATEGORY = 'Logging';
	static PROVIDER_NAME = 'CloudWatch';

	protected _config;
	private logGroupName: string;
	private logStreamName: string;

	constructor(config?) {
		console.log('config!!!');
		console.log(config);
		this._config = config || {};
		this.logGroupName = this._config.logGroupName;
		this.logStreamName = this._config.logStreamName;
	}

	public getCategory(): string {
		return AWSCloudWatchProvider.CATEGORY;
	}

	public getProviderName(): string {
		return AWSCloudWatchProvider.PROVIDER_NAME;
	}

	/**
	 * configure the plugin
	 * @param {Object} config - CloudWatchLogsClientConfig configuration
	 */
	public configure(config): object {
		logger.debug('configure CloudWatch', config);
		const conf = config || {};
		this._config = Object.assign({}, this._config, conf);

		return this._config;
	}

	public async createLogGroup(
		params: CreateLogGroupCommandInput
	): Promise<CreateLogGroupCommandOutput> {
		await this._validateCredentials();

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
	): Promise<DescribeLogGroupsCommandOutput> {
		await this._validateCredentials();

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
	): Promise<CreateLogStreamCommandOutput> {
		await this._validateCredentials();

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
	): Promise<DescribeLogStreamsCommandOutput> {
		await this._validateCredentials();

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
	): Promise<GetLogEventsCommandOutput> {
		await this._validateCredentials();

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
		msgs: InputLogEvent[]
	): Promise<PutLogEventsCommandOutput> {
		const req: PutLogEventsCommandInput = {
			logEvents: msgs,
			logGroupName: this.logGroupName,
			logStreamName: this.logStreamName,
		};

		logger.debug(
			`checking if specified log stream ${this.logStreamName} exists...`
		);

		// Check if log group exists and create if it doesn't
		const existingGroup = await this._validateLogGroupExists(this.logGroupName);
		if (!existingGroup) {
			await this.createLogGroup({ logGroupName: this.logGroupName });
		}

		// Check if log stream exists and create if it doesn't
		const existingStream = await this._validateLogStreamExists(
			this.logGroupName,
			this.logStreamName
		);

		// If a stream already exists, we need to grab the next sequence token
		if (existingStream) {
			req.sequenceToken = existingStream.uploadSequenceToken;
		} else {
			await this.createLogStream({
				logGroupName: this.logGroupName,
				logStreamName: this.logStreamName,
			});
			logger.debug(`created log stream ${this.logStreamName}`);
		}

		logger.debug('sending log events now');
		const output = await this._sendLogEvents(req);
		return output;
	}

	private async _validateLogGroupExists(logGroupName: string) {
		const currGroups = await this.getLogGroups({
			logGroupNamePrefix: logGroupName,
		});

		if (currGroups.logGroups) {
			const foundGroups = currGroups.logGroups.filter(
				group => group.logGroupName === logGroupName
			);
			if (foundGroups.length > 0) {
				return foundGroups[0];
			}
		}

		return null;
	}

	private async _validateLogStreamExists(
		logGroupName: string,
		logStreamName: string
	) {
		const currStreams = await this.getLogStreams({
			logGroupName,
			logStreamNamePrefix: logStreamName,
		});

		if (currStreams.logStreams) {
			const foundStreams = currStreams.logStreams.filter(
				stream => stream.logStreamName === logStreamName
			);
			if (foundStreams.length > 0) {
				return foundStreams[0];
			}
		}

		return null;
	}

	private async _sendLogEvents(
		params: PutLogEventsCommandInput
	): Promise<PutLogEventsCommandOutput> {
		await this._validateCredentials();

		logger.debug('sending log events to stream - ', params.logStreamName);
		const cmd = new PutLogEventsCommand(params);
		const client = this._initCloudWatchLogs();

		try {
			const output = await client.send(cmd);
			return output;
		} catch (error) {
			throw error;
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
				logger.debug('set credentials for storage', cred);
				this._config.credentials = cred;

				return true;
			})
			.catch(error => {
				logger.warn('ensure credentials error', error);
				return false;
			});
	}

	private async _validateCredentials() {
		const credentialsOK = await this._ensureCredentials();
		if (!credentialsOK) {
			return Promise.reject('No credentials');
		}
	}
}
