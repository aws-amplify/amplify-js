// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';

import {
	AnalyticsConfigureAutoTrackInput,
	AnalyticsIdentifyUserInput,
} from '../../../types';

import { IdentifyUserOptions } from './options';

/**
 * Input type for Pinpoint record API.
 */
export type RecordInput = PinpointAnalyticsEvent;

/**
 * Input type for Pinpoint identifyUser API.
 */
export type IdentifyUserInput = AnalyticsIdentifyUserInput<IdentifyUserOptions>;

/**
 * Input type for Pinpoint configureAutoTrack API.
 */
export type ConfigureAutoTrackInput = AnalyticsConfigureAutoTrackInput;
