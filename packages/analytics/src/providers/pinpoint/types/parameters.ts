// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { PinpointAnalyticsEvent } from '@aws-amplify/core/internals/providers/pinpoint';
import { RecordParameters } from '../../../types';

export type PinpointRecordParameters = RecordParameters<PinpointAnalyticsEvent>;

export type IdentifyUserParameters = {
	/**
	 * A User ID associated to the current device.
	 */
	userId: string;

	/**
	 * Additional information about the user and their device.
	 */
	userProfile: UserProfile;
};
