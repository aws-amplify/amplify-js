// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import { getEventBuffer } from '../utils/getEventBuffer';
import { resolveConfig } from '../utils/resolveConfig';
import { resolveCredentials } from '../../../utils';
import { fromUtf8 } from '@smithy/util-utf8';
import { ConsoleLogger } from '@aws-amplify/core/lib/Logger';

const logger = new ConsoleLogger('Kinesis');

export const record = ({
	streamName,
	partitionKey,
	data,
}: RecordInput): void => {
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
				event: ArrayBuffer.isView(data) ? data : fromUtf8(JSON.stringify(data)),
				timestamp,
				retryCount: 0,
			});
		})
		.catch(e => {
			// An error occured while fetching credentials or persisting the event to the buffer
			logger.warn('Failed to record event.', e);
		});
};
