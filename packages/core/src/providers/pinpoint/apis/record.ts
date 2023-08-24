// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { PinpointRecordParameters, PinpointSession } from '../types';
import { getEndpointId } from '../utils';
import { 
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '../utils/PinpointEventBuffer';
import { updateEndpoint } from './updateEndpoint';
import { getEventBuffer } from '../utils/bufferManager';

// TODO(v6) Refactor when we add support for session tracking & `autoTrack`
let session: PinpointSession;

/**
 * @internal
 */
export const record = async ({
	appId,
	category,
	credentials,
	event,
	identityId,
	region,
	userAgentValue,
}: PinpointRecordParameters): Promise<void> => {
	const timestampISOString = new Date().toISOString();
	let endpointId = await getEndpointId(appId, category);

	// Prepare event buffer if required
	const buffer = getEventBuffer({
		appId,
		bufferSize: BUFFER_SIZE,
		credentials,
		flushInterval: FLUSH_INTERVAL,
		flushSize: FLUSH_SIZE,
		identityId,
		region,
		resendLimit: RESEND_LIMIT,
		userAgentValue
	});

	// Generate endpoint if required
	if (!endpointId) {
		await updateEndpoint({
			appId,
			category,
			credentials,
			identityId,
			region,
			userAgentValue,
		});

		endpointId = await getEndpointId(appId, category);
	}

	if (!endpointId) {
		throw new Error('Endpoint was not created.');
	}

	// Generate session if required
	if (!session) {
		const sessionId = uuid();

		session = {
			Id: sessionId,
			StartTimestamp: timestampISOString,
		};
	}

	// Push event to buffer
	buffer.push({
		endpointId,
		event,
		session,
		timestamp: timestampISOString
	});
};
