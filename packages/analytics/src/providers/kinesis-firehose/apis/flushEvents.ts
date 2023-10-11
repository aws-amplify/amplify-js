// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer, resolveConfig } from '../utils';
import {
	getAnalyticsUserAgentString,
	resolveCredentials,
} from '../../../utils';
import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

const logger = new ConsoleLogger('KinesisFirehose');

/**
 * Flushes all buffered Kinesis events to the service.
 *
 * @note
 * This API will make a best-effort attempt to flush events from the buffer. Events recorded immediately after invoking
 * this API may not be included in the flush.
 */
export const flushEvents = () => {
	const { region, flushSize, flushInterval, bufferSize, resendLimit } =
		resolveConfig();
	resolveCredentials()
		.then(({ credentials, identityId }) =>
			getEventBuffer({
				region,
				flushSize,
				flushInterval,
				bufferSize,
				credentials,
				identityId,
				resendLimit,
				userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
			})
		)
		.then(eventBuffer => eventBuffer.flushAll())
		.catch(e => logger.warn('Failed to flush events.', e));
};
