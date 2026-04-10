// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, ConsoleLogger } from '@aws-amplify/core';
import { AnalyticsAction } from '@aws-amplify/core/internals/utils';

import { resolveConfig } from '../utils/resolveConfig';
import {
	getAnalyticsUserAgentString,
	resolveCredentials,
} from '../../../utils';
import { getEventBuffer } from '../utils/getEventBuffer';

const logger = new ConsoleLogger('Kinesis');

/**
 * Flushes all buffered Kinesis events to the service.
 *
 * @note
 * This API will make a best-effort attempt to flush events from the buffer. Events recorded immediately after invoking
 * this API may not be included in the flush.
 */
export const flushEvents = (ctx: AmplifyContext) => {
	const { region, flushSize, flushInterval, bufferSize, resendLimit } =
		resolveConfig(ctx);
	resolveCredentials(ctx)
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
			}),
		)
		.then(eventBuffer => eventBuffer.flushAll())
		.catch(e => {
			logger.warn('Failed to flush events.', e);
		});
};
