// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';
import { UpdateEndpointException } from '@aws-amplify/core/internals/providers/pinpoint';

import { AnalyticsValidationErrorCode } from '../../../errors';
import {
	TrackerAttributes,
	TrackerInterface,
	TrackerType,
} from '../../../types/trackers';
import {
	updateProviderTrackers,
	validateTrackerConfiguration,
} from '../../../utils';
import { ConfigureAutoTrackInput } from '../types';

import { record } from './record';

// Configured Tracker instances for Pinpoint
const configuredTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};

// Callback that will emit an appropriate event to Pinpoint when required by the Tracker
const emitTrackingEvent = (ctx: AmplifyContext, 
	eventName: string,
	attributes: TrackerAttributes,
) => {
	record(ctx, {
		name: eventName,
		attributes,
	});
};

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
export function configureAutoTrack(
	ctx: AmplifyContext,
	input: ConfigureAutoTrackInput,
): void;
export function configureAutoTrack(...args: any[]): void {
	const [ctx, input] = resolveCtxArgs<ConfigureAutoTrackInput>(args);
	validateTrackerConfiguration(input);

	// Initialize or update this provider's trackers
	updateProviderTrackers(input, emitTrackingEvent.bind(null, ctx), configuredTrackers);
}
