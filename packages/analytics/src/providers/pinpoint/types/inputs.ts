// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';

export type RecordInput = {
	/**
	 * An event to send to the default Analytics provider.
	 */
	event: PinpointAnalyticsEvent;
};

export type IdentifyUserInput = {
	/**
	 * A User ID associated to the current device.
	 */
	userId: string;

	/**
	 * Additional information about the user and their device.
	 */
	userProfile: UserProfile;
};
