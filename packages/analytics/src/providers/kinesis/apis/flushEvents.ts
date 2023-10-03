// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../utils/resolveConfig';
import { resolveCredentials } from '../../../utils';
import { getEventBuffer } from '../utils/getEventBuffer';
import { ConsoleLogger } from '@aws-amplify/core/internals/utils';

const logger = new ConsoleLogger('Kinesis');

/**
 * This API attempts to flush all the events cached in the active buffer.
 * Since it operates asynchronously, there is no guarantee that the most recently recorded event will be flushed.
 * */
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
			})
		)
		.then(eventBuffer => eventBuffer.flushAll())
		.catch(e => logger.warn('Failed to flush events.', e));
};
