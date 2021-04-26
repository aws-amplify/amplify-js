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

export interface CloudWatchLoggerParams {
	name: string;
	region: string;
	logGroupName: string;
	logStreamName: string;
}

/**
 * Write logs to CloudWatch
 * @class CloudWatchLogger
 */
export class CloudWatchLogger {
	name: string;
	region: string;
	logGroupName: string;
	logStreamName: string;
	cloudWatch: any;

	/**
	 *
	 * @param {CloudWatchLoggerParams} params
	 * name - name of the logger
	 * region - region where your CloudWatch logs should be published
	 * logGroupName - name of the log group to publish to
	 * logStreamName - name of the log stream in the specified log group to publish to
	 *
	 */
	constructor(params: CloudWatchLoggerParams) {
		const { name, region, logGroupName, logStreamName } = params;

		this.name = name;
		this.region = region;
		this.logGroupName = logGroupName;
		this.logStreamName = logStreamName;
		this.cloudWatch = new AWSCloudWatchProvider({ region });
	}

	/**
	 *
	 * @param msg
	 * sendToCloudWatch will create the log group and log stream if they do not
	 * exist already, then publish the messages into the stream.
	 *
	 */
	public async sendToCloudWatch(...msg) {
		await this.cloudWatch.pushLogs({
			logEvents: [{ message: JSON.stringify(msg), timestamp: Date.now() }],
			logGroupName: this.logGroupName,
			logStreamName: this.logStreamName,
		});
	}
}
