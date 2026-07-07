// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { PushNotificationValidationErrorCode, assert } from '../../../errors';

/**
 * Path of the device-registration route on the Amazon Connect Customer Profiles
 * REST endpoint. The endpoint associates a device token (keyed on the caller's
 * verified Cognito `sub`) with their Customer Profile.
 *
 * @internal
 */
export const IDENTIFY_USER_PATH = '/identify-user';

/**
 * Path of the guest (Identity Pool unauthenticated, IAM/SigV4) device-registration
 * route on the Amazon Connect Customer Profiles REST endpoint. The endpoint
 * associates a device token (keyed on the caller's Identity Pool `identityId`)
 * with their guest Customer Profile.
 *
 * @internal
 */
export const GUEST_IDENTIFY_USER_PATH = '/identify-user-guest';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { endpoint, region } =
		Amplify.getConfig().Notifications?.PushNotification?.CustomerProfiles ?? {};
	assert(!!endpoint, PushNotificationValidationErrorCode.NoEndpoint);
	assert(!!region, PushNotificationValidationErrorCode.NoRegion);

	return { endpoint, region };
};
