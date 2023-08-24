// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuid } from 'uuid';
import { PinpointRecordParameters, PinpointSession } from '../types';
import { getEndpointId } from '../utils';
import { updateEndpoint } from './updateEndpoint';
import { AmplifyError } from '../../../libraryUtils';

// TODO(v6) Refactor when we add support for session tracking & `autoTrack`
let session: PinpointSession;

/**
 * @internal
 */
export const record = async ({
	appId,
	category,
	credentials,
	identityId,
	region,
	userAgentValue,
}: PinpointRecordParameters): Promise<void> => {
	const timestampISOString = new Date().toISOString();
	let endpointId = await getEndpointId(appId, category);

	// TODO Prepare event buffer if required

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
			message: 'Endpoint was not created.'
		});
	}

	// Generate session if required
	if (!session) {
		const sessionId = uuid();

		session = {
			Id: sessionId,
			StartTimestamp: timestampISOString,
		};
	}

	// TODO(v6) Append the event to the Pinpoint event buffer
};
