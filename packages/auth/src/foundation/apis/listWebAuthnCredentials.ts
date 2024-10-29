// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { ListWebAuthnCredentialsException } from '../factories/serviceClients/cognitoIdentityProvider/types';
import { assertAuthTokens } from '../../providers/cognito/utils/types';
import { createCognitoUserPoolEndpointResolver } from '../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../parsers';
import { getAuthUserAgentValue } from '../../utils';
import { createListWebAuthnCredentialsClient } from '../factories/serviceClients/cognitoIdentityProvider';
import {
	AuthWebAuthnCredential,
	ListWebAuthnCredentialsInput,
	ListWebAuthnCredentialsOutput,
} from '../types';
import { AuthError } from '../../errors/AuthError';

/**
 * Lists registered credentials for an authenticated user
 *
 * @returns Promise<ListWebAuthnCredentialsOutput>
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link ListWebAuthnCredentialsException}
 * - Thrown due to a service error when listing WebAuthn credentials
 */
export async function listWebAuthnCredentials(
	input?: ListWebAuthnCredentialsInput,
): Promise<ListWebAuthnCredentialsOutput> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession();
	assertAuthTokens(tokens);

	const listWebAuthnCredentialsResult = createListWebAuthnCredentialsClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const { Credentials: commandCredentials = [], NextToken: nextToken } =
		await listWebAuthnCredentialsResult(
			{
				region: getRegionFromUserPoolId(userPoolId),
				userAgentValue: getAuthUserAgentValue(
					AuthAction.ListWebAuthnCredentials,
				),
			},
			{
				AccessToken: tokens.accessToken.toString(),
				MaxResults: input?.pageSize,
				NextToken: input?.nextToken,
			},
		);

	const credentials: AuthWebAuthnCredential[] = commandCredentials.map(
		item => ({
			credentialId: item.CredentialId,
			friendlyCredentialName: item.FriendlyCredentialName,
			relyingPartyId: item.RelyingPartyId,
			authenticatorAttachment: item.AuthenticatorAttachment,
			authenticatorTransports: item.AuthenticatorTransports,
			createdAt: item.CreatedAt ? new Date(item.CreatedAt * 1000) : undefined,
		}),
	);

	return {
		credentials,
		nextToken,
	};
}
