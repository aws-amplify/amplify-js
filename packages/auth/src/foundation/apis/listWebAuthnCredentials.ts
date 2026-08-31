// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

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

export async function listWebAuthnCredentials(
	amplify: AmplifyContext,
	input?: ListWebAuthnCredentialsInput,
): Promise<ListWebAuthnCredentialsOutput> {
	const authConfig = amplify.resourcesConfig.Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;

	const { tokens } = await amplify.fetchAuthSession();
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
