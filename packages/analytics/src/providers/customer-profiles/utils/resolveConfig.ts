// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * Path of the authenticated (Cognito user-pool) identify route.
 *
 * @internal
 */
export const IDENTIFY_USER_PATH = '/identify-user';

/**
 * Path of the guest (Identity Pool unauthenticated, IAM/SigV4) identify route.
 *
 * @internal
 */
export const GUEST_IDENTIFY_USER_PATH = '/identify-user-guest';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { endpoint, region } =
		Amplify.getConfig().Analytics?.CustomerProfiles ?? {};
	assertValidationError(!!endpoint, AnalyticsValidationErrorCode.NoEndpoint);
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);

	return { endpoint, region };
};
