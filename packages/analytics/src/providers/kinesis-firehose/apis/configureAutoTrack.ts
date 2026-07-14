// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import {
	TrackerAttributes,
	TrackerInterface,
	TrackerType,
} from '../../../types/trackers';
import {
	updateProviderTrackers,
	validateTrackerConfiguration,
} from '../../../utils';
import { KinesisFirehoseConfigureAutoTrackInput } from '../types';

import { record } from './record';

// Configured Tracker instances for Kinesis Data Firehose
const configuredTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};

/**
 * Configures automatic event tracking for Kinesis Data Firehose. This API will automatically transmit an analytic
 * event to the configured Firehose delivery stream when configured events are detected within your application.
 * This can include: DOM element events (via the `event` tracker), session events (via the `session` tracker), and
 * page view events (via the `pageView` tracker).
 *
 * Auto-tracked events are recorded with a data payload of the shape `{ name: eventName, attributes }`.
 *
 * @remark Only session tracking is currently supported on React Native.
 *
 * @param {KinesisFirehoseConfigureAutoTrackInput} input The input object to configure auto track behavior.
 *
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect, or when `streamName` is missing while enabling a tracker.
 *
 * @example
 * ```ts
 * // Enable session tracking
 * configureAutoTrack({
 *     enable: true,
 *     type: 'session',
 *     options: {
 *         streamName: 'myFirehoseStream',
 *     },
 * });
 * ```
 *
 * @example
 * ```ts
 * // Enable page view tracking for a single-page application
 * configureAutoTrack({
 *     enable: true,
 *     type: 'pageView',
 *     options: {
 *         streamName: 'myFirehoseStream',
 *         appType: 'singlePage',
 *     },
 * });
 * ```
 *
 * @example
 * ```ts
 * // Enable DOM element event tracking
 * configureAutoTrack({
 *     enable: true,
 *     type: 'event',
 *     options: {
 *         streamName: 'myFirehoseStream',
 *     },
 * });
 * ```
 */
export const configureAutoTrack = (
	input: KinesisFirehoseConfigureAutoTrackInput,
): void => {
	validateTrackerConfiguration(input);

	if (input.enable) {
		assertValidationError(
			!!input.options?.streamName,
			AnalyticsValidationErrorCode.NoStreamName,
		);
	}

	// Callback that will emit an appropriate event to Kinesis Data Firehose when required by the Tracker
	const emitTrackingEvent = (
		eventName: string,
		attributes: TrackerAttributes,
	) => {
		record({
			streamName: input.options!.streamName,
			data: {
				name: eventName,
				attributes,
			},
		});
	};

	// Initialize or update this provider's trackers. The 'kinesis-firehose' namespace
	// keeps page-view tracking state isolated from other providers (e.g. Pinpoint).
	updateProviderTrackers(
		input,
		emitTrackingEvent,
		configuredTrackers,
		'kinesis-firehose',
	);
};
