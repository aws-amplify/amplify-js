// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsAction } from '@aws-amplify/core/internals/utils';
import { ConsoleLogger } from '@aws-amplify/core';

import { getEventBuffer, resolveConfig } from '../utils';
import {
	getAnalyticsUserAgentString,
	resolveCredentials,
} from '../../../utils';

const logger = new ConsoleLogger('Personalize');

/**
 * Flushes all buffered Personalize events to the service.
 *
 * @note
 * This API will make a best-effort attempt to flush events from the buffer. Events recorded immediately after invoking
 * this API may not be included in the flush.
 */
export const flushEvents = () => {
	const { region, flushSize, bufferSize, flushInterval } = resolveConfig();
	resolveCredentials()
		.then(({ credentials, identityId }) =>
			getEventBuffer({
				region,
				flushSize,
				flushInterval,
				bufferSize,
				credentials,
				identityId,
				userAgentValue: getAnalyticsUserAgentString(AnalyticsAction.Record),
			}),
		)
		.then(eventBuffer => eventBuffer.flushAll())
		.catch(e => {
			logger.warn('Failed to flush events', e);
		});
};
