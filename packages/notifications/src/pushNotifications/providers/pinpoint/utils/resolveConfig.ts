// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assert, PushNotificationValidationErrorCode } from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { appId, region } =
		Amplify.getConfig().Notifications?.PushNotification?.Pinpoint ?? {};
	assert(!!appId, PushNotificationValidationErrorCode.NoAppId);
	assert(!!region, PushNotificationValidationErrorCode.NoRegion);
	return { appId, region };
};
