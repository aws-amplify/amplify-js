// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { PushNotificationValidationErrorCode, assert } from '../../../errors';

/**
 * Resolves the caller's identity used to authorize device-registration requests
 * to the Amazon Connect Customer Profiles endpoint.
 *
 * Two mutually-exclusive shapes are returned:
 *  - Authenticated (Cognito user-pool): a bearer `token` is present. The authed
 *    route (`POST /identify-user`) is used with `Authorization: Bearer <token>`
 *    and the backend keys the profile on the token's verified `sub`.
 *  - Guest (Identity Pool unauthenticated): no `token`, but `credentials` +
 *    `identityId` are present. The guest route (`POST /identify-user-guest`) is
 *    used, SigV4-signed with the guest credentials (service `execute-api`), and
 *    the backend keys the profile on the caller's `identityId`.
 *
 * @internal
 */
export const resolveCredentials = async () => {
	const { tokens, credentials, identityId } = await fetchAuthSession();
	const token = tokens?.accessToken?.toString();

	// Either an authenticated bearer token, or guest Identity Pool credentials
	// must be resolvable — otherwise there is no way to authorize the request.
	assert(
		!!token || !!credentials,
		PushNotificationValidationErrorCode.NoCredentials,
	);

	return { token, credentials, identityId };
};
