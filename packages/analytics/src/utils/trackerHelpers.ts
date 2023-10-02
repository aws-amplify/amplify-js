// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsValidationErrorCode, assertValidationError } from '../errors';
import { AnalyticsConfigureAutoTrackInput } from '../types';
import { TrackerType, TrackerAttributes } from '../types/trackers';

/**
 * Validates a tracker
 */
export const validateTrackerConfiguration = (
	input: AnalyticsConfigureAutoTrackInput
) => {
	assertValidationError(
		input.type === 'event' ||
			input.type === 'pageView' ||
			input.type === 'session',
		AnalyticsValidationErrorCode.InvalidTracker
	);
};

/**
 * Updates a provider's trackers as appropriate for the provided auto-track configuration.
 *
 * @note
 * This utility will mutate the provider's configured trackers via `providerTrackers`.
 */
export const updateProviderTrackers = (
	input: AnalyticsConfigureAutoTrackInput,
	providerTrackers: Partial<Record<TrackerType, object>>,
	providerEventRecorder: (
		eventName: string,
		attributes: TrackerAttributes
	) => void
) => {
	const currentTracker = providerTrackers[input.type];

	if (!input.enable) {
		// Tracker was disabled, clean it up
		if (currentTracker) {
			// TODO call currentTracker.cleanup();
			delete providerTrackers[input.type];
		}

		return;
	}

	if (currentTracker) {
		// Re-configure the existing tracker instance
	} else {
		// Create a new tracker instance
	}
};
