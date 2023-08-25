// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	AuthTokens,
	Identity,
	getId,
} from '@aws-amplify/core';
import { Logger } from '@aws-amplify/core/internals/utils';
import { formLoginsMap } from './credentialsProvider';
import { AuthError } from '../../../errors/AuthError';
import { IdentityIdStore } from './types';

const logger = new Logger('CognitoIdentityIdProvider');

/**
 * Provides a Cognito identityId
 *
 * @param tokens - The AuthTokens received after SignIn
 * @returns string
 * @throws internal: {@link AuthError }
 *  - Auth errors that may arise from misconfiguration.
 *
 */
export async function cognitoIdentityIdProvider({
	tokens,
	authConfig,
	identityIdStore,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
	identityIdStore: IdentityIdStore;
}): Promise<string> {
	if (authConfig) identityIdStore.setAuthConfig(authConfig);
	let identityId = await identityIdStore.loadIdentityId();

	if (tokens) {
		// Tokens are available so return primary identityId
		if (identityId && identityId.type === 'primary') {
			return identityId.id;
		} else {
			const logins = tokens.idToken
				? formLoginsMap(tokens.idToken.toString(), 'COGNITO', authConfig)
				: {};
			// TODO(V6): reuse previous guest idenityId if present
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
	identityIdStore.storeIdentityId(identityId);
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
