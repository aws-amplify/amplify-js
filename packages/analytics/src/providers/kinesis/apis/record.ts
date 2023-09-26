// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import { getEventBuffer } from '../utils/getEventBuffer';
import { resolveConfig } from '../utils/resolveConfig';
import { KinesisEventData } from '@aws-amplify/core/src/providers/kinesis/types';
import { resolveCredentials } from '../../../utils';
import { fromUtf8 } from '@smithy/util-utf8';
import { ConsoleLogger as Logger } from '@aws-amplify/core/lib-esm/Logger';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

const convertToByteArray = (data: KinesisEventData): Uint8Array =>
	ArrayBuffer.isView(data) ? data : fromUtf8(JSON.stringify(data));

const logger = new Logger('Analytics');

export const record = ({
	streamName,
	partitionKey,
	data,
}: RecordInput): void => {
	assertValidationError(
		!!streamName,
		AnalyticsValidationErrorCode.NoStreamName
	);
	assertValidationError(
		!!partitionKey,
		AnalyticsValidationErrorCode.NoPartitionKey
	);
	assertValidationError(!!data, AnalyticsValidationErrorCode.NoData);

	const timestamp = Date.now();
	const { region, bufferSize, flushSize, flushInterval, resendLimit } =
		resolveConfig();

	resolveCredentials()
		.then(({ credentials, identityId }) => {
			const buffer = getEventBuffer({
				region,
				bufferSize,
				flushSize,
				flushInterval,
				credentials,
				identityId,
				resendLimit,
			});

			buffer.append({
				region,
				streamName,
				partitionKey,
				event: convertToByteArray(data),
				timestamp,
				retryCount: 0,
			});
		})
		.catch(e => {
			// An error occured while fetching credentials or persisting the event to the buffer
			logger.warn('Failed to record event.', e);
		});
};
