// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import {
	InAppMessagingValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = (ctx: AmplifyContext) => {
	const { appId, region } =
		ctx.resourcesConfig.Notifications?.InAppMessaging?.Pinpoint ?? {};
	assertValidationError(!!appId, InAppMessagingValidationErrorCode.NoAppId);
	assertValidationError(!!region, InAppMessagingValidationErrorCode.NoRegion);

	return { appId, region };
};
