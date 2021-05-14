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

import { AWSCloudWatchProvider } from '../Providers';
import { ConsoleLogger, LOG_TYPE } from './ConsoleLogger';

interface CloudLoggerParams {
	name: string;
	region: string;
	logGroupName: string;
	logStreamName: string;
}

class CloudLogger extends ConsoleLogger {
	name: string;
	region?: string;
	logGroupName?: string;
	logStreamName?: string;
	cloudWatch: AWSCloudWatchProvider;

	constructor(params: CloudLoggerParams) {
		const { name, region, logGroupName, logStreamName } = params;
		super(name);

		this.name = name;
		this.region = region;
		this.logGroupName = logGroupName;
		this.logStreamName = logStreamName;
		this.cloudWatch = new AWSCloudWatchProvider({
			region,
			logGroupName,
			logStreamName,
		});
	}

	private async _sendToCloudWatch(message: string, timestamp: number) {
		try {
			await this.cloudWatch.pushLogs([{ message, timestamp }]);
		} catch (err) {
			const errorMessage = `Failed to send log to Cloudwatch. Error: ${err}`;
			this._log(LOG_TYPE.ERROR, errorMessage);
		}
	}

	private _handleLog(type: LOG_TYPE, msg: string, timestamp: number) {
		this._log(type, msg);
		this._sendToCloudWatch(msg, timestamp);
	}

	public log(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.INFO, msg, timestamp);
	}

	public info(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.INFO, msg, timestamp);
	}

	public error(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.ERROR, msg, timestamp);
	}

	public debug(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.DEBUG, msg, timestamp);
	}

	public warn(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.WARN, msg, timestamp);
	}

	public verbose(msg: string, timestamp = Date.now()) {
		this._handleLog(LOG_TYPE.VERBOSE, msg, timestamp);
	}
}

export { CloudLogger, CloudLoggerParams };
