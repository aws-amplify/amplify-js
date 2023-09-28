// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordInput } from '../types';
import { getEventBuffer, resolveConfig } from '../utils';
import { resolveCredentials } from '../../../utils';
import { fromUtf8 } from '@smithy/util-utf8';
import { ConsoleLogger as Logger } from '@aws-amplify/core/lib/Logger';

const logger = new Logger('KinesisFirehose');

export const record = ({ streamName, data }: RecordInput): void => {
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
