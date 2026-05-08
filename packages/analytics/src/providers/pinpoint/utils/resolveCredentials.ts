// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveCredentials = async (ctx: AmplifyContext) => {
	const { credentials, identityId } = await ctx.fetchAuthSession();
	assertValidationError(
		!!credentials,
		AnalyticsValidationErrorCode.NoCredentials,
	);

	return { credentials, identityId };
};
