// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';

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
import { KinesisConfigureAutoTrackInput } from '../types';

import { record } from './record';

// Configured Tracker instances for Kinesis
const configuredTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};

/**
 * Configures automatic event tracking for Kinesis. This API will automatically transmit an analytic event to the
 * configured Kinesis stream when configured events are detected within your application. This can include: DOM
 * element events (via the `event` tracker), session events (via the `session` tracker), and page view events (via
 * the `pageView` tracker).
 *
 * Auto-tracked events are recorded with a data payload of the shape `{ name: eventName, attributes }`.
 *
 * @remark Only session tracking is currently supported on React Native.
 *
 * @param {KinesisConfigureAutoTrackInput} input The input object to configure auto track behavior.
 *
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect, or when `streamName` / `partitionKey` are missing while enabling a tracker.
 *
 * @example
 * ```ts
 * // Enable session tracking
 * configureAutoTrack({
 *     enable: true,
 *     type: 'session',
 *     options: {
 *         streamName: 'myKinesisStream',
 *         partitionKey: 'myPartitionKey',
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
 *         streamName: 'myKinesisStream',
 *         partitionKey: 'myPartitionKey',
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
 *         streamName: 'myKinesisStream',
 *         partitionKey: 'myPartitionKey',
 *     },
 * });
 * ```
 */
export function configureAutoTrack(input: KinesisConfigureAutoTrackInput): void;
export function configureAutoTrack(
	ctx: AmplifyContext,
	input: KinesisConfigureAutoTrackInput,
): void;
export function configureAutoTrack(...args: any[]): void {
	// Resolve the optional leading context WITHOUT falling back to the global
	// context. The context is only needed when events are emitted; resolving it
	// eagerly would (a) throw when trackers are configured before
	// `Amplify.configure()` and (b) pin auto-tracked events to the configuration
	// snapshot captured at setup time after a later `configure()` call.
	const [ctx, input] = isAmplifyContext(args[0])
		? [args[0] as AmplifyContext, args[1] as KinesisConfigureAutoTrackInput]
		: [undefined, args[0] as KinesisConfigureAutoTrackInput];
	validateTrackerConfiguration(input);

	if (input.enable) {
		assertValidationError(
			!!input.options?.streamName,
			AnalyticsValidationErrorCode.NoStreamName,
		);
		assertValidationError(
			!!input.options?.partitionKey,
			AnalyticsValidationErrorCode.NoPartitionKey,
		);
	}

	// Callback that will emit an appropriate event to Kinesis when required by the Tracker.
	// When no explicit context was supplied, `record` resolves the global context
	// lazily at emit time so auto-tracked events follow the live configuration.
	const emitTrackingEvent = (
		eventName: string,
		attributes: TrackerAttributes,
	) => {
		const recordInput = {
			streamName: input.options!.streamName,
			partitionKey: input.options!.partitionKey,
			data: {
				name: eventName,
				attributes,
			},
		};
		if (ctx) {
			record(ctx, recordInput);
		} else {
			record(recordInput);
		}
	};

	// Initialize or update this provider's trackers. The 'kinesis' namespace keeps
	// page-view tracking state isolated from other providers (e.g. Pinpoint).
	updateProviderTrackers(
		input,
		emitTrackingEvent,
		configuredTrackers,
		'kinesis',
	);
}
