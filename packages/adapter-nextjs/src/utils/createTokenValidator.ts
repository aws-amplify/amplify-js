// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageMethodValidator } from '@aws-amplify/core/internals/adapter-core';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

import { TokenVerifierMap } from '../types';

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
	const verifierMap: TokenVerifierMap = {};
	if (userPoolId && clientId) {
		verifierMap.id = CognitoJwtVerifier.create({
			userPoolId,
			tokenUse: 'id',
			clientId,
		});
		verifierMap.access = CognitoJwtVerifier.create({
			userPoolId,
			tokenUse: 'access',
			clientId,
		});
	}

	return {
		// validate access, id tokens
		getItem: async (key: string, value: string): Promise<boolean> => {
			const verifier = key.includes('.accessToken')
				? verifierMap.access
				: key.includes('.idToken')
					? verifierMap.id
					: null;

			if (!verifier) return true;
			if (!userPoolId || !clientId) return false;

			return isValidCognitoToken({
				token: value,
				verifier,
			});
		},
	};
};
