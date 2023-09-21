// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { PushNotificationServiceOptions } from '.';

/**
 * Constructs an `identifyUser` input.
 */
export type PushNotificationIdentifyUserInput<
	ServiceOptions extends PushNotificationServiceOptions = PushNotificationServiceOptions
> = {
	/**
	 * A User ID associated to the current device.
	 */
	userId: string;

	/**
	 * Additional information about the user and their device.
	 */
	userProfile: UserProfile;

	/**
	 * Options to be passed to the API.
	 */
	options?: {
		serviceOptions?: ServiceOptions;
	};
};
