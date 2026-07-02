// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * Resolves the Cognito user-pool access token used to authenticate requests to
 * the Customer Profiles endpoint.
 *
 * @internal
 */
export const resolveCredentials = async () => {
	const { tokens } = await fetchAuthSession();
	const token = tokens?.accessToken?.toString();
	assertValidationError(!!token, AnalyticsValidationErrorCode.NoCredentials);

	return { token };
};
