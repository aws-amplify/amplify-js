// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * Resolves the caller's identity used to authenticate requests to the Customer
 * Profiles endpoint.
 *
 * Two mutually-exclusive shapes are returned:
 *  - Authenticated (Cognito user-pool): a bearer `token` is present. The authed
 *    route (`POST /identify-user`) is used with `Authorization: Bearer <token>`.
 *  - Guest (Identity Pool unauthenticated): no `token`, but `credentials` +
 *    `identityId` are present. The guest route is used, SigV4-signed with the
 *    guest credentials (service `execute-api`).
 *
 * @internal
 */
export const resolveCredentials = async () => {
	const { tokens, credentials, identityId } = await fetchAuthSession();
	const token = tokens?.accessToken?.toString();

	// Either an authenticated bearer token, or guest Identity Pool credentials
	// must be resolvable — otherwise there is no way to authorize the request.
	assertValidationError(
		!!token || !!credentials,
		AnalyticsValidationErrorCode.NoCredentials,
	);

	return { token, credentials, identityId };
};
