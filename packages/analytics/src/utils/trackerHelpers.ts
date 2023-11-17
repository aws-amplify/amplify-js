// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	TrackerEventRecorder,
	TrackerInterface,
	TrackerType,
} from '~/src/types/trackers';
import { EventTracker, PageViewTracker, SessionTracker } from '~/src/trackers';
import { ConfigureAutoTrackInput } from '~/src/providers/pinpoint/types';

/**
 * Updates a provider's trackers as appropriate for the provided auto-track configuration.
 *
 * @remark
 * This utility will mutate the provider's configured trackers via `providerTrackers`.
 */
export const updateProviderTrackers = (
	input: ConfigureAutoTrackInput,
	providerEventRecorder: TrackerEventRecorder,
	providerTrackers: Partial<Record<TrackerType, TrackerInterface>>,
) => {
	let trackerInstance;
	const trackerType = input.type;
	const currentTracker = providerTrackers[trackerType];

	// Check if the tracker was disabled & should be cleaned up
	if (!input.enable) {
		if (currentTracker) {
			currentTracker.cleanup();
			delete providerTrackers[trackerType];
		}

		return;
	}

	// Re-configure the existing tracker, or create & configure an instance if it doesn't exist yet
	if (currentTracker) {
		currentTracker.configure(providerEventRecorder, input.options);

		return;
	}

	// Create a new tracker instance for the type
	if (trackerType === 'event') {
		trackerInstance = new EventTracker(providerEventRecorder, input.options);
	} else if (trackerType === 'pageView') {
		trackerInstance = new PageViewTracker(providerEventRecorder, input.options);
	} else if (trackerType === 'session') {
		trackerInstance = new SessionTracker(providerEventRecorder, input.options);
	}

	if (trackerInstance) {
		providerTrackers[trackerType] = trackerInstance;
	}
};
