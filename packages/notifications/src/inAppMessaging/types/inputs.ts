// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';

import { InAppMessagingServiceOptions } from './options';

/**
 * Input type for `identifyUser`.
 */
export interface InAppMessagingIdentifyUserInput<
	ServiceOptions extends
		InAppMessagingServiceOptions = InAppMessagingServiceOptions,
> {
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
	options?: ServiceOptions;
}
