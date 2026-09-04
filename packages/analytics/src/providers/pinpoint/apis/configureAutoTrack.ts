// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { UpdateEndpointException } from '@aws-amplify/core/internals/providers/pinpoint';

import { AnalyticsValidationErrorCode } from '../../../errors';
import {
	TrackerAttributes,
	TrackerInterface,
	TrackerType,
} from '../../../types/trackers';
import {
	peekCtxArgs,
	updateProviderTrackers,
	validateTrackerConfiguration,
} from '../../../utils';
import { ConfigureAutoTrackInput } from '../types';

import { record } from './record';

// Configured Tracker instances for Pinpoint
const configuredTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};
export function configureAutoTrack(
	ctx: AmplifyContext,
	input: ConfigureAutoTrackInput,
): void;

/**
 * Configures automatic event tracking for Pinpoint. This API will automatically transmit an analytic event when
 * configured events are detected within your application. This can include: DOM element events (via the `event`
 * tracker), session events (via the `session` tracker), and page view events (via the `pageView` tracker).
 *
 * @deprecated AWS will end support for Amazon Pinpoint on October 30, 2026.
 *
 * @remark Only session tracking is currently supported on React Native.
 *
 * @param {ConfigureAutoTrackInput} params The input object to configure auto track behavior.
 *
 * @throws service: {@link UpdateEndpointException} - Thrown when the underlying Pinpoint service returns an error.
 * @throws validation: {@link AnalyticsValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 */
export function configureAutoTrack(input: ConfigureAutoTrackInput): void;
export function configureAutoTrack(...args: any[]): void {
	// Peek the optional leading context WITHOUT falling back to the global
	// context. The context is only needed when events are emitted; resolving it
	// eagerly would (a) throw when trackers are configured before
	// `Amplify.configure()` and (b) pin auto-tracked events to the configuration
	// snapshot captured at setup time after a later `configure()` call.
	const { ctx, input } = peekCtxArgs<ConfigureAutoTrackInput>(args);

	validateTrackerConfiguration(input);

	// Callback that will emit an appropriate event to Pinpoint when required by the Tracker.
	// When no explicit context was supplied, `record` resolves the global context
	// lazily at emit time, so auto-tracked events follow the live configuration
	// and trackers can be set up before `Amplify.configure()` is called.
	const emitTrackingEvent = (
		eventName: string,
		attributes: TrackerAttributes,
	) => {
		const recordInput = {
			name: eventName,
			attributes,
		};
		if (ctx) {
			record(ctx, recordInput);
		} else {
			record(recordInput);
		}
	};

	// Initialize or update this provider's trackers
	updateProviderTrackers(input, emitTrackingEvent, configuredTrackers);
}
