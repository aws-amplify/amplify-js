// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, LocalStorage } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession, signOut } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../utils/types';
import { deleteUser as deleteUserClient } from '../utils/clients/CognitoIdentityProvider';
import { createKeysForAuthStorage } from '../tokenProvider/TokenStore';
import { DeleteUserException } from '../types/errors';
/**
 * Deletes a user from the user pool while authenticated.
 *
 * @throws - {@link DeleteUserException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function deleteUser(): Promise<void> {
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

	await signOut();

	await deleteDeviceKeys(authConfig.userPoolClientId);
}

async function deleteDeviceKeys(userPoolClientId: string): Promise<void> {
	const { NewDeviceMetadata } = createKeysForAuthStorage(
		'cognito',
		userPoolClientId
	);

	if (typeof window !== 'undefined') {
		await LocalStorage.removeItem(NewDeviceMetadata);
	}
}
