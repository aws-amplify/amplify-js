// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { PushNotificationValidationErrorCode, assert } from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = (ctx: AmplifyContext) => {
	const { appId, region } =
		ctx.resourcesConfig.Notifications?.PushNotification?.Pinpoint ?? {};
	assert(!!appId, PushNotificationValidationErrorCode.NoAppId);
	assert(!!region, PushNotificationValidationErrorCode.NoRegion);

	return { appId, region };
};
