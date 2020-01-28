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
var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { AWSKinesisProvider } from './index';
import * as Firehose from 'aws-sdk/clients/firehose';
var logger = new Logger('AWSKineisFirehoseProvider');
var AWSKinesisFirehoseProvider = /** @class */ (function(_super) {
	__extends(AWSKinesisFirehoseProvider, _super);
	function AWSKinesisFirehoseProvider(config) {
		return _super.call(this, config) || this;
	}
	/**
	 * get provider name of the plugin
	 */
	AWSKinesisFirehoseProvider.prototype.getProviderName = function() {
		return 'AWSKinesisFirehose';
	};
	AWSKinesisFirehoseProvider.prototype._sendEvents = function(group) {
		var _this = this;
		if (group.length === 0) {
			return;
		}
		var _a = group[0],
			config = _a.config,
			credentials = _a.credentials;
		var initClients = this._init(config, credentials);
		if (!initClients) return false;
		var records = {};
		group.map(function(params) {
			// spit by streamName
			var evt = params.event;
			var streamName = evt.streamName;
			if (records[streamName] === undefined) {
				records[streamName] = [];
			}
			var PartitionKey =
				evt.partitionKey || 'partition-' + credentials.identityId;
			Object.assign(evt.data, { PartitionKey: PartitionKey });
			var Data = JSON.stringify(evt.data);
			var record = { Data: Data };
			records[streamName].push(record);
		});
		Object.keys(records).map(function(streamName) {
			logger.debug(
				'putting records to kinesis',
				streamName,
				'with records',
				records[streamName]
			);
			_this._kinesisFirehose.putRecordBatch(
				{
					Records: records[streamName],
					DeliveryStreamName: streamName,
				},
				function(err) {
					if (err) logger.debug('Failed to upload records to Kinesis', err);
					else logger.debug('Upload records to stream', streamName);
				}
			);
		});
	};
	AWSKinesisFirehoseProvider.prototype._init = function(config, credentials) {
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
		var region = config.region;
		return this._initFirehose(region, credentials);
	};
	AWSKinesisFirehoseProvider.prototype._initFirehose = function(
		region,
		credentials
	) {
		logger.debug('initialize kinesis firehose with credentials', credentials);
		this._kinesisFirehose = new Firehose({
			apiVersion: '2015-08-04',
			region: region,
			credentials: credentials,
		});
		return true;
	};
	return AWSKinesisFirehoseProvider;
})(AWSKinesisProvider);
export default AWSKinesisFirehoseProvider;
//# sourceMappingURL=AWSKinesisFirehoseProvider.js.map
