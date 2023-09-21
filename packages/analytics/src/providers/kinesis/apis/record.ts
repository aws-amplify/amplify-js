// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import { getEventBuffer } from '../utils/getEventBuffer';
import { resolveConfig } from '../utils/resolveConfig';
import { KinesisEventData } from '@aws-amplify/core/src/providers/kinesis/types';
import { resolveCredentials } from '../utils/resolveCredentials';
import { fromUtf8 } from '@smithy/util-utf8';

const convertToByteArray = (data: KinesisEventData): Uint8Array =>
	ArrayBuffer.isView(data) ? data : fromUtf8(JSON.stringify(data));

export const record = ({ event }: RecordInput): void => {
	const timestamp = Date.now();
	const { streamName, partitionKey, data } = event;
	const { region, bufferSize, flushSize, flushInterval, resendLimit } =
		resolveConfig();

	resolveCredentials().then(({ credentials, identityId }) => {
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
	});
};
