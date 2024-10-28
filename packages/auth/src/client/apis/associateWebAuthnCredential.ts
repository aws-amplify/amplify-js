// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import {
	GetWebAuthnRegistrationOptionsException,
	VerifyWebAuthnRegistrationResultException,
} from '../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { assertAuthTokens } from '../../providers/cognito/utils/types';
import { createCognitoUserPoolEndpointResolver } from '../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../foundation/parsers';
import { getAuthUserAgentValue } from '../../utils';
import { registerPasskey } from '../utils';
import {
	createGetWebAuthnRegistrationOptionsClient,
	createVerifyWebAuthnRegistrationResultClient,
} from '../../foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	PasskeyError,
	PasskeyErrorCode,
	assertPasskeyError,
} from '../utils/passkey/errors';
import { AuthError } from '../../errors/AuthError';

/**
 * Registers a new passkey for an authenticated user
 *
 * @returns Promise<AssociateWebAuthnCredentialOutput>
 * @throws - {@link PasskeyError}:
 * - Thrown when intermediate state is invalid
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link GetWebAuthnRegistrationOptionsException}
 * - Thrown due to a service error retrieving WebAuthn registration options
 * @throws - {@link VerifyWebAuthnRegistrationResultException}
 * - Thrown due to a service error when verifying WebAuthn registration result
 */
export async function associateWebAuthnCredential(): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;

	assertTokenProviderConfig(authConfig);

	const { userPoolEndpoint, userPoolId } = authConfig;

	const { tokens } = await fetchAuthSession();

	assertAuthTokens(tokens);

	const getWebAuthnRegistrationOptions =
		createGetWebAuthnRegistrationOptionsClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});

	const { CredentialCreationOptions: credentialCreationOptions } =
		await getWebAuthnRegistrationOptions(
			{
				region: getRegionFromUserPoolId(userPoolId),
				userAgentValue: getAuthUserAgentValue(
					AuthAction.GetWebAuthnRegistrationOptions,
				),
			},
			{
				AccessToken: tokens.accessToken.toString(),
			},
		);

	assertPasskeyError(
		!!credentialCreationOptions,
		PasskeyErrorCode.InvalidCredentialCreationOptions,
	);

	const cred = await registerPasskey(JSON.parse(credentialCreationOptions));

	const verifyWebAuthnRegistrationResult =
		createVerifyWebAuthnRegistrationResultClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});

	await verifyWebAuthnRegistrationResult(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(
				AuthAction.VerifyWebAuthnRegistrationResult,
			),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			Credential: JSON.stringify(cred),
		},
	);
}
