// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBufferConfig } from '../types/buffer';
import { PinpointEventBuffer } from './PinpointEventBuffer';
import { BUFFER_SIZE, FLUSH_INTERVAL, FLUSH_SIZE, RESEND_LIMIT } from './constants';

// Map of buffers by region -> appId
const eventBufferMap: Record<string, Record<string, PinpointEventBuffer>> = {};

/**
 * Returns a PinpointEventBuffer instance for the specified region & app ID, creating one if it does not yet exist.
 * 
 * @internal
 */
export const getEventBuffer = ({
	appId,
	bufferSize = BUFFER_SIZE,
	credentials,
	flushInterval = FLUSH_INTERVAL,
	flushSize = FLUSH_SIZE,
	identityId,
	region,
	resendLimit = RESEND_LIMIT,
	userAgentValue
}: EventBufferConfig): PinpointEventBuffer => {
	if (eventBufferMap[region]?.[appId]) {
		const buffer = eventBufferMap[region][appId];

		/*
		If the identity has changed flush out the buffer and create a new instance. The old instance will be garbage 
		collected.
		*/
		if (buffer.identityHasChanged(identityId)) {
			buffer.flush();
		} else {
			return buffer;
		}
	}

	const buffer = new PinpointEventBuffer({
		appId,
		bufferSize,
		credentials,
		flushInterval,
		flushSize,
		identityId,
		region,
		resendLimit,
		userAgentValue
	});

	if (!eventBufferMap[region]) {
		eventBufferMap[region] = {};
	}

	eventBufferMap[region][appId] = buffer;

	return buffer;
};
