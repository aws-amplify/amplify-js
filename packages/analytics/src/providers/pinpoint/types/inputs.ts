// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';
import { IdentifyUserOptions } from '.';
import { AnalyticsIdentifyUserInput } from '../../../types';

/**
 * Input type for Pinpoint record API.
 */
export type RecordInput = {
	/**
	 * An event to send to the default Analytics provider.
	 */
	event: PinpointAnalyticsEvent;
};

export type IdentifyUserInput = AnalyticsIdentifyUserInput<IdentifyUserOptions>;
