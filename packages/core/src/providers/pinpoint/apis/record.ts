// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '../../../utils/amplifyUuid';
import { PinpointRecordInput, PinpointSession } from '../types';
import { resolveEndpointId } from '../utils';
import {
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '../utils/constants';
import { getEventBuffer } from '../utils/getEventBuffer';

// TODO(v6) Refactor when we add support for session tracking & `autoTrack`
let session: PinpointSession;

/**
 * @internal
 */
export const record = async ({
	appId,
	category,
	channelType,
	credentials,
	event,
	identityId,
	region,
	userAgentValue,
}: PinpointRecordInput): Promise<void> => {
	const timestampISOString = new Date().toISOString();
	const eventId = amplifyUuid();

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

	const endpointId = await resolveEndpointId({
		appId,
		category,
		channelType,
		credentials,
		identityId,
		region,
		userAgentValue,
	});

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
