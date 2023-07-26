// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
import {
	Logger,
	AuthConfig,
	AuthTokens,
	Identity,
	defaultIdentityIdStore,
	decodeJWT,
} from '@aws-amplify/core';
import { formLoginsMap } from './credentialsProvider';

// import {
// 	AuthConfig,
// 	AuthTokens,
// } from '@aws-amplify/core/src/singleton/Auth/types';
// import { Identity } from '@aws-amplify/core/src/singleton/Auth/types';
// import { DefaultIdentityIdStore } from '@aws-amplify/core/src/singleton/Auth/IdentityIdStore';

const logger = new Logger('IdentityIdProvider');

export async function getIdentityId({
	tokens,
	authConfig,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
}): Promise<string> {
	console.log('tokens: ', tokens);
	// tokens = {
	// 	accessToken: decodeJWT(
	// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
	// 	),
	// 	accessTokenExpAt: Date.UTC(2023, 7, 24, 17, 55),
	// 	idToken: decodeJWT(
	// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0'
	// 	),
	// };
	if (authConfig) defaultIdentityIdStore.setAuthConfig(authConfig);
	console.log('Here 1');

	let identityId = await defaultIdentityIdStore.loadIdentityId();
	console.log('Here, loaded identityId: ', identityId);

	if (tokens) {
		// Tokens are avaliable so retrun primary identityId
		// look in-memory
		if (identityId && identityId.type === 'primary') {
			console.log('IdentityID, Existing identityId: ', identityId);

			return identityId.id;
		} else {
			let logins = tokens.idToken
				? formLoginsMap(tokens.idToken.toString(), 'COGNITO')
				: {};
			console.log('IdentityID, logins: ', logins);

			let generatedIdentityId = await generateIdentityId(logins, authConfig);

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

			//TODO(V6): clear guest id in local storage
		}
	} else {
		// Tokens are avaliable so return guest identityId
		if (identityId && identityId.type === 'guest') {
			return identityId.id;
		} else {
			console.log('Here, no tokens & generating id');
			identityId = {
				id: await generateIdentityId({}, authConfig),
				type: 'guest',
			};

			//TODO(V6): store guest id in local storage
		}
	}

	// Store in-memory
	defaultIdentityIdStore.storeIdentityId(identityId);
	logger.debug(`The identity being returned ${identityId}`);
	return identityId.id;
}

async function generateIdentityId(
	logins: {},
	authConfig?: AuthConfig
): Promise<string> {
	const identityPoolId = authConfig?.identityPoolId;

	// Access config to obtain IdentityPoolId & region
	if (!identityPoolId) {
		logger.debug('No Cognito Federated Identity pool provided');
		return Promise.reject('No Cognito Federated Identity pool provided');
	}

	// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
	// Region is not needed for this API as suggested by the API spec: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetId.html
	const idResult =
		// for a first-time user, this will return a brand new identity
		// for a returning user, this will retrieve the previous identity assocaited with the logins
		(
			await getIdClient({
				IdentityPoolId: identityPoolId,
				Logins: logins,
			})
		).IdentityId;

	if (!idResult) {
		throw Error('Cannot fetch IdentityId');
	}
	console.log('generated IdentityId: ', idResult);

	return idResult;
}

export async function setIdentityId(newIdentityId: Identity): Promise<void> {
	defaultIdentityIdStore.storeIdentityId(newIdentityId);
}
