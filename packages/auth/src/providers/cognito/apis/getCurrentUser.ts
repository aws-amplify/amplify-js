// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 as Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import { GetCurrentUserRequest, AuthUser } from '../../../types';
import { assertAuthTokens } from '../utils/types';
import { InitiateAuthException } from '../types/errors';

/**
 * Gets the current user from the idToken.
 *
 * @param getCurrentUserRequest - The request object.
 *
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns AuthUser
 */
export const getCurrentUser = async (
	getCurrentUserRequest?: GetCurrentUserRequest
): Promise<AuthUser> => {
	const authConfig = Amplify.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession({
		forceRefresh: getCurrentUserRequest?.recache ?? false,
	});
	assertAuthTokens(tokens);
	const { payload } = tokens.idToken;

	return {
		username: payload['cognito:username'] as string,
		userId: payload['sub'] as string,
	};
};
