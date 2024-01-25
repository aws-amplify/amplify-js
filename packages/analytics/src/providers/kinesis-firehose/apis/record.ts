// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import { getEventBuffer, resolveConfig } from '../utils';
import {
	getAnalyticsUserAgentString,
	isAnalyticsEnabled,
	resolveCredentials,
} from '../../../utils';
import { fromUtf8 } from '@smithy/util-utf8';
import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

const logger = new ConsoleLogger('KinesisFirehose');

/**
 * Record one analytic event and send it to Kinesis Data Firehose. Events will be buffered and periodically sent to
 * Kinesis Data Firehose.
 *
 * @param params The input object used to construct the request.
 *
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 *
 * @example
 * ```ts
 * record({
 *     streamName: 'myFirehoseStream',
 *     data: { } // The data blob to put into the record
 * });
 * ```
 */
export const record = ({ streamName, data }: RecordInput): void => {
	if (!isAnalyticsEnabled()) {
		logger.debug('Analytics is disabled, event will not be recorded.');
		return;
	}

	const timestamp = Date.now();
	const { region, bufferSize, flushSize, flushInterval, resendLimit } =
		resolveConfig();

	resolveCredentials()
		.then(({ credentials, identityId }) => {
			const buffer = getEventBuffer({
				region,
				credentials,
				identityId,
				bufferSize,
				flushSize,
				flushInterval,
				resendLimit,
				userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
			});

			buffer.append({
				region,
				streamName,
				event: ArrayBuffer.isView(data) ? data : fromUtf8(JSON.stringify(data)),
				timestamp,
				retryCount: 0,
			});
		})
		.catch(e => {
			logger.warn('Failed to record event.', e);
		});
};
