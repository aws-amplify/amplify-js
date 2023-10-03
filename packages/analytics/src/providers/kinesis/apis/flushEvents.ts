// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../utils/resolveConfig';
import { resolveCredentials } from '../../../utils';
import { getEventBuffer } from '../utils/getEventBuffer';
import { ConsoleLogger } from '@aws-amplify/core/internals/utils';

const logger = new ConsoleLogger('Kinesis');

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
