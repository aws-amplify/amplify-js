// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBufferConfig } from '../types/buffer';
import { PinpointEventBuffer } from './PinpointEventBuffer';

// Map of buffers by region -> appId
const eventBuffer: Record<string, Record<string, PinpointEventBuffer>> = {};

/**
 * Returns a PinpointEventBuffer instance for the specified region & app ID, creating one if it does not yet exist.
 * 
 * @internal
 */
export const getEventBuffer = (bufferConfig: EventBufferConfig): PinpointEventBuffer => {
	const { region, appId, identityId } = bufferConfig;

	if (eventBuffer[region] && eventBuffer[region][appId]) {
		const buffer = eventBuffer[region][appId];

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

	const buffer = new PinpointEventBuffer(bufferConfig);

	if (!eventBuffer[region]) {
		eventBuffer[region] = {};
	}

	eventBuffer[region][appId] = buffer;

	return buffer;
};
