// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokens } from '../utils/types';
import { DeleteUserException } from '../types/errors';
import { tokenOrchestrator } from '../tokenProvider';
import { getAuthUserAgentValue } from '../../../utils';
import { createDeleteUserClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

import { signOut } from './signOut';

/**
 * Deletes a user from the user pool while authenticated.
 *
 * @throws - {@link DeleteUserException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function deleteUser(): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);
	const serviceDeleteUser = createDeleteUserClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await serviceDeleteUser(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.DeleteUser),
		},
		{
			AccessToken: tokens.accessToken.toString(),
		},
	);
	await tokenOrchestrator.clearDeviceMetadata();
	await signOut();
}
