// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import {
	CompleteWebAuthnRegistrationException,
	StartWebAuthnRegistrationException,
} from '../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { assertAuthTokens } from '../../providers/cognito/utils/types';
import { createCognitoUserPoolEndpointResolver } from '../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../foundation/parsers';
import { getAuthUserAgentValue } from '../../utils';
import { registerPasskey } from '../utils';
import {
	createCompleteWebAuthnRegistrationClient,
	createStartWebAuthnRegistrationClient,
} from '../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { PasskeyError } from '../utils/passkey/errors';
import { AuthError } from '../../errors/AuthError';
import { assertValidCredentialCreationOptions } from '../utils/passkey/types';

/**
 * Registers a new passkey for an authenticated user
 *
 * @returns Promise<void>
 * @throws - {@link PasskeyError}:
 * - Thrown when intermediate state is invalid
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link StartWebAuthnRegistrationException}
 * - Thrown due to a service error retrieving WebAuthn registration options
 * @throws - {@link CompleteWebAuthnRegistrationException}
 * - Thrown due to a service error when verifying WebAuthn registration result
 */
export async function associateWebAuthnCredential(): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;

	assertTokenProviderConfig(authConfig);

	const { userPoolEndpoint, userPoolId } = authConfig;

	const { tokens } = await fetchAuthSession();

	assertAuthTokens(tokens);

	const startWebAuthnRegistration = createStartWebAuthnRegistrationClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const { CredentialCreationOptions: credentialCreationOptions } =
		await startWebAuthnRegistration(
			{
				region: getRegionFromUserPoolId(userPoolId),
				userAgentValue: getAuthUserAgentValue(
					AuthAction.StartWebAuthnRegistration,
				),
			},
			{
				AccessToken: tokens.accessToken.toString(),
			},
		);

	assertValidCredentialCreationOptions(credentialCreationOptions);

	const cred = await registerPasskey(credentialCreationOptions);

	const completeWebAuthnRegistration = createCompleteWebAuthnRegistrationClient(
		{
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		},
	);

	await completeWebAuthnRegistration(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(
				AuthAction.CompleteWebAuthnRegistration,
			),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			Credential: cred,
		},
	);
}
