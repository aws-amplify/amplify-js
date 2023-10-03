// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	EventTrackingOpts,
	PageViewTrackingOpts,
	SessionTrackingOpts,
	TrackerType,
	TrackerAttributes,
} from '../types/trackers';

/**
 * Updates a provider's trackers as appropriate for the provided auto-track configuration.
 *
 * @note
 * This utility will mutate the provider's configured trackers via `providerTrackers`.
 */
export const updateProviderTrackers = (
	trackerType: TrackerType,
	enabled: boolean,
	providerEventRecorder: (
		eventName: string,
		attributes: TrackerAttributes
	) => void,
	providerTrackers: Partial<Record<TrackerType, object>>,
	trackerOptions?:
		| EventTrackingOpts
		| PageViewTrackingOpts
		| SessionTrackingOpts
) => {
	const currentTracker = providerTrackers[trackerType];

	if (!enabled) {
		// Tracker was disabled, clean it up
		if (currentTracker) {
			// TODO call currentTracker.cleanup();
			delete providerTrackers[trackerType];
		}

		return;
	}

	if (currentTracker) {
		// Re-configure the existing tracker instance
	} else {
		// Create a new tracker instance
	}
};
