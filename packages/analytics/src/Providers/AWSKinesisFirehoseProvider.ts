// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsAction, ConsoleLogger as Logger } from '@aws-amplify/core';
import { AWSKinesisProvider } from './AWSKinesisProvider';
import {
	PutRecordBatchCommand,
	FirehoseClient,
} from '@aws-sdk/client-firehose';
import { fromUtf8 } from '@aws-sdk/util-utf8-browser';
import { getAnalyticsUserAgent } from '../utils/UserAgent';

const logger = new Logger('AWSKineisFirehoseProvider');

export class AWSKinesisFirehoseProvider extends AWSKinesisProvider {
	private _kinesisFirehose: FirehoseClient;

	constructor(config?) {
		super(config);
	}

	/**
	 * get provider name of the plugin
	 */
	public getProviderName(): string {
		return 'AWSKinesisFirehose';
	}

	protected _sendEvents(group) {
		if (group.length === 0) {
			return;
		}

		const { config, credentials } = group[0];

		const initClients = this._init(config, credentials);
		if (!initClients) return false;

		const records = {};

		group.map(params => {
			// split by streamName
			const evt = params.event;
			const { streamName, data } = evt;
			if (records[streamName] === undefined) {
				records[streamName] = [];
			}

			const bufferData =
				data && typeof data !== 'string' ? JSON.stringify(data) : data;
			const Data = fromUtf8(bufferData);
			const record = { Data };
			records[streamName].push(record);
		});

		Object.keys(records).map(streamName => {
			logger.debug(
				'putting records to kinesis',
				streamName,
				'with records',
				records[streamName]
			);

			this._kinesisFirehose
				.send(
					new PutRecordBatchCommand({
						Records: records[streamName],
						DeliveryStreamName: streamName,
					})
				)
				.then(res => logger.debug('Upload records to stream', streamName))
				.catch(err => logger.debug('Failed to upload records to Kinesis', err));
		});
	}

	protected _init(config, credentials) {
		logger.debug('init clients');

		if (
			this._kinesisFirehose &&
			this._config.credentials &&
			this._config.credentials.sessionToken === credentials.sessionToken &&
			this._config.credentials.identityId === credentials.identityId
		) {
			logger.debug('no change for analytics config, directly return from init');
			return true;
		}

		this._config.credentials = credentials;
		const { region } = config;

		return this._initFirehose(region, credentials);
	}

	private _initFirehose(region, credentials) {
		logger.debug('initialize kinesis firehose with credentials', credentials);
		this._kinesisFirehose = new FirehoseClient({
			apiVersion: '2015-08-04',
			region,
			credentials,
			customUserAgent: getAnalyticsUserAgent(AnalyticsAction.Record),
		});
		return true;
	}
}
