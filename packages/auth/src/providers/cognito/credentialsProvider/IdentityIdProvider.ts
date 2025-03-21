// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthTokens, Identity, getId } from '@aws-amplify/core';
import { CognitoIdentityPoolConfig } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../errors/AuthError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { getRegionFromIdentityPoolId } from '../../../foundation/parsers';
import { GetIdException } from '../types/errors';

import { IdentityIdStore } from './types';
import { formLoginsMap } from './utils';

/**
 * Provides a Cognito identityId
 *
 * @param tokens - The AuthTokens received after SignIn
 * @returns string
 * @throws configuration exceptions: `InvalidIdentityPoolIdException`
 *  - Auth errors that may arise from misconfiguration.
 * @throws service exceptions: {@link GetIdException }
 */
export async function cognitoIdentityIdProvider({
	tokens,
	authConfig,
	identityIdStore,
}: {
	tokens?: AuthTokens;
	authConfig: CognitoIdentityPoolConfig;
	identityIdStore: IdentityIdStore;
}): Promise<string> {
	identityIdStore.setAuthConfig({ Cognito: authConfig });

	// will return null only if there is no identityId cached or if there is an error retrieving it
	const identityId: Identity | null = await identityIdStore.loadIdentityId();

	if (identityId) {
		return identityId.id;
	}
	const logins = tokens?.idToken
		? formLoginsMap(tokens.idToken.toString())
		: {};
	const generatedIdentityId = await generateIdentityId(logins, authConfig);
	// Store generated identityId
	identityIdStore.storeIdentityId({
		id: generatedIdentityId,
		type: tokens ? 'primary' : 'guest',
	});

	return generatedIdentityId;
}

async function generateIdentityId(
	logins: Record<string, string>,
	authConfig: CognitoIdentityPoolConfig,
): Promise<string> {
	const identityPoolId = authConfig?.identityPoolId;
	const region = getRegionFromIdentityPoolId(identityPoolId);

	// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
	let idResult: string | undefined;
	// for a first-time user, this will return a brand new identity
	// for a returning user, this will retrieve the previous identity assocaited with the logins
	try {
		idResult = (
			await getId(
				{
					region,
				},
				{
					IdentityPoolId: identityPoolId,
					Logins: logins,
				},
			)
		).IdentityId;
	} catch (e) {
		assertServiceError(e);
		throw new AuthError(e);
	}
	if (!idResult) {
		throw new AuthError({
			name: 'GetIdResponseException',
			message: 'Received undefined response from getId operation',
			recoverySuggestion:
				'Make sure to pass a valid identityPoolId in the configuration.',
		});
	}

	return idResult;
}
