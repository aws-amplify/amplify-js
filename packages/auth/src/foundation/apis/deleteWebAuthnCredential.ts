// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { DeleteWebAuthnCredentialException } from '../factories/serviceClients/cognitoIdentityProvider/types';
import { assertAuthTokens } from '../../providers/cognito/utils/types';
import { createCognitoUserPoolEndpointResolver } from '../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../parsers';
import { getAuthUserAgentValue } from '../../utils';
import { createDeleteWebAuthnCredentialClient } from '../factories/serviceClients/cognitoIdentityProvider';
import { DeleteWebAuthnCredentialInput } from '../types';
import { AuthError } from '../../errors/AuthError';

/**
 * Delete a registered credential for an authenticated user by credentialId
 *
 * @returns Promise<void>
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link DeleteWebAuthnCredentialException}
 * - Thrown due to a service error when deleting a WebAuthn credential
 */
export async function deleteWebAuthnCredential(
	input: DeleteWebAuthnCredentialInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const deleteWebAuthnCredentialResult = createDeleteWebAuthnCredentialClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	await deleteWebAuthnCredentialResult(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(
				AuthAction.DeleteWebAuthnCredential,
			),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			CredentialId: input.credentialId,
		},
	);
}
