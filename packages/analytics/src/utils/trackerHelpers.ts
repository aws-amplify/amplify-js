// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	TrackerEventRecorder,
	TrackerInterface,
	TrackerType,
} from '../types/trackers';
import { EventTracker, PageViewTracker, SessionTracker } from '../trackers';
import { AnalyticsConfigureAutoTrackInput } from '../types/inputs';

/**
 * Updates a provider's trackers as appropriate for the provided auto-track configuration.
 *
 * @remark
 * This utility will mutate the provider's configured trackers via `providerTrackers`.
 *
 * @param namespace - Optional provider identifier used to namespace shared page-view
 *  tracking state (the `sessionStorage` key). Providers that can be enabled alongside
 *  another provider's `pageView` auto-track (e.g. Kinesis, Kinesis Firehose) must pass a
 *  unique value so each provider records page views independently instead of clobbering a
 *  shared key.
 */
export const updateProviderTrackers = (
	input: AnalyticsConfigureAutoTrackInput,
	providerEventRecorder: TrackerEventRecorder,
	providerTrackers: Partial<Record<TrackerType, TrackerInterface>>,
	namespace?: string,
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
		// Only forward the namespace when a provider supplies one, so providers that
		// don't (e.g. Pinpoint) keep the original two-argument construction.
		trackerInstance = namespace
			? new PageViewTracker(providerEventRecorder, input.options, namespace)
			: new PageViewTracker(providerEventRecorder, input.options);
	} else if (trackerType === 'session') {
		trackerInstance = new SessionTracker(providerEventRecorder, input.options);
	}

	if (trackerInstance) {
		providerTrackers[trackerType] = trackerInstance;
	}
};
