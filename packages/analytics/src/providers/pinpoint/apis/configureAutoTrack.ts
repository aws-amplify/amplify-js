// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsValidationErrorCode } from '../../../errors';
import {
	TrackerType,
	TrackerAttributes,
	TrackerInterface,
} from '../../../types/trackers';
import {
	updateProviderTrackers,
	validateTrackerConfiguration,
} from '../../../utils';
import { ConfigureAutoTrackInput } from '../types';
import { record } from './record';

// Configured Tracker instances for Pinpoint
let configuredTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};

// TODO Add more inline documentation & examples
/**
 * Configures automatic event tracking for Pinpoint.
 *
 * @param {ConfigureAutoTrackInput} params The input object to configure auto track behavior.
 *
 * @throws service: {@link UpdateEndpointException} - Thrown when the underlying Pinpoint service returns an error.
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 */
export const configureAutoTrack = (input: ConfigureAutoTrackInput): void => {
	validateTrackerConfiguration(input);

	// TODO Check global session tracking config?

	// Callback that will emit an appropriate event to Pinpoint when required by the Tracker
	const emitTrackingEvent = (
		eventName: string,
		attributes: TrackerAttributes
	) => {
		record({
			name: eventName,
			attributes,
		});
	};

	// Initialize or update this provider's trackers
	updateProviderTrackers(input, emitTrackingEvent, configuredTrackers);
};
