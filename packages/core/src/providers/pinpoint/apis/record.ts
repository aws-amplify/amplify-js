// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '../../../utils/amplifyUuid';
import { PinpointRecordInput, PinpointSession } from '../types';
import { getEndpointId } from '../utils';
import {
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '../utils/constants';
import { updateEndpoint } from './updateEndpoint';
import { getEventBuffer } from '../utils/getEventBuffer';
import { AmplifyError } from '../../../errors';

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
}: PinpointRecordInput): Promise<void> => {
	const timestampISOString = new Date().toISOString();
	const eventId = amplifyUuid();
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
		userAgentValue,
	});

	// Prepare a Pinpoint endpoint via updateEndpoint if one does not already exist, which will generate and cache an
	// endpoint ID between calls
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
		throw new AmplifyError({
			name: 'ENDPOINT_NOT_CREATED',
			message: 'Endpoint was not created.',
		});
	}

	// Generate session if required
	if (!session) {
		const sessionId = amplifyUuid();

		session = {
			Id: sessionId,
			StartTimestamp: timestampISOString,
		};
	}

	// Push event to buffer
	buffer.push({
		eventId,
		endpointId,
		event,
		session,
		timestamp: timestampISOString,
		resendLimit: RESEND_LIMIT,
	});
};
