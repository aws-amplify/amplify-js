// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import {
	PushNotificationValidationErrorCode,
	assert,
} from '../errors/errorHelpers';

/**
 * @internal
 */
export const resolveCredentials = async (ctx: AmplifyContext) => {
	const { credentials, identityId } = await ctx.fetchAuthSession();
	assert(!!credentials, PushNotificationValidationErrorCode.NoCredentials);

	return { credentials, identityId };
};
