// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { assertAuthTokens } from '../../providers/cognito/utils/types';
import { createCognitoUserPoolEndpointResolver } from '../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../parsers';
import { getAuthUserAgentValue } from '../../utils';
import { createDeleteWebAuthnCredentialClient } from '../factories/serviceClients/cognitoIdentityProvider';
import { DeleteWebAuthnCredentialInput } from '../types';

export async function deleteWebAuthnCredential(
	amplify: AmplifyClassV6,
	input: DeleteWebAuthnCredentialInput,
): Promise<void> {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await amplify.Auth.fetchAuthSession();
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
