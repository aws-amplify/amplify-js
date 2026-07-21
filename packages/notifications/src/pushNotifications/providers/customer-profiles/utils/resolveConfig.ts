// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { PushNotificationValidationErrorCode, assert } from '../../../errors';

/**
 * Path of the identify-user route on the Amazon Connect Customer Profiles REST
 * endpoint. Associates the caller's `userProfile` with their Customer Profile.
 * The backend derives `principalId` server-side from the SigV4 signer identity.
 *
 * @internal
 */
export const IDENTIFY_USER_PATH = '/identify-user';

/**
 * Path of the register-device route. Registers (upserts) a push device object,
 * keyed on the caller's server-derived `principalId`.
 *
 * @internal
 */
export const REGISTER_DEVICE_PATH = '/register-device';

/**
 * Path of the remove-device route. De-registers a push device object. The
 * backend gates removal on the caller's server-derived `principalId`.
 *
 * @internal
 */
export const REMOVE_DEVICE_PATH = '/remove-device';

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
