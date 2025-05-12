// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageMethodValidator } from 'aws-amplify/adapter-core/internals';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { JwtVerifier } from '../types';

import { isValidCognitoToken } from './isValidCognitoToken';

interface CreateTokenValidatorInput {
	userPoolId?: string;
	userPoolClientId?: string;
}

/**
 * Creates a validator object for validating methods in a KeyValueStorage.
 */
export const createTokenValidator = ({
	userPoolId,
	userPoolClientId: clientId,
}: CreateTokenValidatorInput): KeyValueStorageMethodValidator => {
	let idTokenVerifier: JwtVerifier;
	let accessTokenVerifier: JwtVerifier;

	return {
		// validate access, id tokens
		getItem: async (key: string, value: string): Promise<boolean> => {
			const isAccessToken = key.includes('.accessToken');
			const isIdToken = key.includes('.idToken');

			if (!isAccessToken && !isIdToken) {
				return true;
			}

			if (!userPoolId || !clientId) {
				return false;
			}

			if (isAccessToken && !accessTokenVerifier) {
				accessTokenVerifier = CognitoJwtVerifier.create({
					userPoolId,
					tokenUse: 'access',
					clientId,
				});
			}

			if (isIdToken && !idTokenVerifier) {
				idTokenVerifier = CognitoJwtVerifier.create({
					userPoolId,
					tokenUse: 'id',
					clientId,
				});
			}

			return isValidCognitoToken({
				token: value,
				verifier: isAccessToken ? accessTokenVerifier : idTokenVerifier,
			});
		},
	};
};
