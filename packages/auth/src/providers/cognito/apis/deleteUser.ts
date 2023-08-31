// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, LocalStorage } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../utils/types';
import { deleteUser as deleteUserClient } from '../utils/clients/CognitoIdentityProvider';
import { DeleteUserException } from '../types/errors';
import { DefaultTokenStore } from '../tokenProvider/TokenStore';
import { tokenOrchestrator } from '../tokenProvider';
/**
 * Deletes a user from the user pool while authenticated.
 *
 * @throws - {@link DeleteUserException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function deleteUser(): Promise<void> {
	const tokenStore = new DefaultTokenStore();
	tokenStore.setKeyValueStorage(LocalStorage);
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);

	await deleteUserClient(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	// Todo: TokenOrchestrator
	// 1. create a method to delete only deviceKeys
	// Todo:
	// 1. Clean auth tokens
	// 2. clean creds
	// 3. clean device keys
}
