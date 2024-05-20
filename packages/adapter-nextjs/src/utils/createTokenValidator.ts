// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isValidCognitoToken } from '@aws-amplify/core/internals/utils';
import { KeyValueStorageMethodValidator } from '@aws-amplify/core/internals/adapter-core';

/**
 * Creates a validator object for validating methods in a KeyValueStorage.
 */
export const createTokenValidator = ({
	userPoolId,
	userPoolClientId: clientId,
}: {
	userPoolId: string | undefined;
	userPoolClientId: string | undefined;
}): KeyValueStorageMethodValidator => {
	return {
		// validate access, id tokens
		getItem: async (key: string, value: string): Promise<boolean> => {
			const tokenType = key.includes('.accessToken')
				? 'access'
				: key.includes('.idToken')
					? 'id'
					: null;
			if (!tokenType) return true;

			if (!userPoolId || !clientId) return false;

			return isValidCognitoToken({
				clientId,
				userPoolId,
				tokenType,
				token: value,
			});
		},
	};
};
