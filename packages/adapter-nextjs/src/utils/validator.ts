// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isValidCognitoToken } from '@aws-amplify/core/internals/utils';
import { KeyValueStorageInterface } from '@aws-amplify/core';

// TODO import type from here
// import { Validator } from '@aws-amplify/core/internals/adapter-core';

export type Validator = Partial<
	Record<keyof KeyValueStorageInterface, ValidatorFunction>
>;

type ValidatorFunction = (...args: any[]) => Promise<boolean>;

/**
 * Creates a validator object for validating methods in a KeyValueStorage.
 */
export const validator = ({
	userPoolId,
	userPoolClientId: clientId,
}: {
	userPoolId: string | undefined;
	userPoolClientId: string | undefined;
}): Validator => {
	return {
		// validate access, id tokens
		getItem: async (key: string, value: string): Promise<boolean> => {
			const tokenType = key.includes('.accessToken')
				? 'access'
				: key.includes('.idToken')
					? 'id'
					: null;
			if (!tokenType) return true;

			// TODO: is this correct ?
			// make sure userPoolId && clientId are present if token is access/id
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
