// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Logger,
	AuthConfig,
	AuthTokens,
	Identity,
	getId,
} from '@aws-amplify/core';
import { formLoginsMap } from './credentialsProvider';
import { AuthError } from '../../../errors/AuthError';
import { defaultIdentityIdStore } from '.';

const logger = new Logger('CognitoIdentityIdProvider');

/**
 * Provides a Cognito identityId
 *
 * @param tokens - The AuthTokens received after SignIn
 * @returns string
 * @throws internal: {@link AuthError }
 *  - Auth errors that may arise from misconfiguration.
 *
 * TODO(V6): convert the Auth errors to config errors
 */
export async function cognitoIdentityIdProvider({
	tokens,
	authConfig,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
}): Promise<string> {
	if (authConfig) defaultIdentityIdStore.setAuthConfig(authConfig);
	let identityId = await defaultIdentityIdStore.loadIdentityId();

	if (tokens) {
		// Tokens are available so return primary identityId
		if (identityId && identityId.type === 'primary') {
			return identityId.id;
		} else {
			const logins = tokens.idToken
				? formLoginsMap(tokens.idToken.toString(), 'COGNITO')
				: {};
			const generatedIdentityId = await generateIdentityId(logins, authConfig);

			if (identityId && identityId.id === generatedIdentityId) {
				// if guestIdentity is found and used by GetCredentialsForIdentity
				// it will be linked to the logins provided, and disqualified as an unauth identity
				logger.debug(
					`The guest identity ${identityId.id} has become the primary identity`
				);
			}
			identityId = {
				id: generatedIdentityId,
				type: 'primary',
			};
		}
	} else {
		// Tokens are avaliable so return guest identityId
		if (identityId && identityId.type === 'guest') {
			return identityId.id;
		} else {
			identityId = {
				id: await generateIdentityId({}, authConfig),
				type: 'guest',
			};
		}
	}

	// Store in-memory or local storage
	defaultIdentityIdStore.storeIdentityId(identityId);
	logger.debug(`The identity being returned ${identityId.id}`);
	return identityId.id;
}

async function generateIdentityId(
	logins: {},
	authConfig?: AuthConfig
): Promise<string> {
	const identityPoolId = authConfig?.identityPoolId;

	// Access config to obtain IdentityPoolId & region
	if (!identityPoolId) {
		throw new AuthError({
			name: 'IdentityPoolIdConfigException',
			message: 'No Cognito Identity pool provided',
			recoverySuggestion: 'Make sure to pass a valid identityPoolId to config.',
		});
	}
	const region = identityPoolId.split(':')[0];

	// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
	// Region is not needed for this API as suggested by the API spec:
	// https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
	const idResult =
		// for a first-time user, this will return a brand new identity
		// for a returning user, this will retrieve the previous identity assocaited with the logins
		(
			await getId(
				{
					region,
				},
				{
					IdentityPoolId: identityPoolId,
					Logins: logins,
				}
			)
		).IdentityId;
	if (!idResult) {
		throw new AuthError({
			name: 'IdentityIdResponseException',
			message: 'Did not receive an identityId from Cognito identity pool',
			recoverySuggestion:
				'Make sure to pass a valid identityPoolId in the configuration.',
		});
	}
	return idResult;
}

export async function setIdentityId(newIdentityId: Identity): Promise<void> {
	defaultIdentityIdStore.storeIdentityId(newIdentityId);
}
