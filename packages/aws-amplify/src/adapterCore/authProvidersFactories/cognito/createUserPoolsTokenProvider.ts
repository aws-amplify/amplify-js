// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DefaultTokenStore,
	TokenOrchestrator,
	CognitoUserPoolTokenRefresher,
} from '@aws-amplify/auth/cognito';
import { KeyValueStorageInterface, TokenProvider } from '@aws-amplify/core';

/**
 * Creates an object that implements {@link TokenProvider}.
 * @param keyValueStorage An object that implements the {@link KeyValueStorageInterface}.
 * @returns An object that implements {@link TokenProvider}.
 */
export const createUserPoolsTokenProvider = (
	keyValueStorage: KeyValueStorageInterface
): TokenProvider => {
	const authTokenStore = new DefaultTokenStore();
	authTokenStore.setKeyValueStorage(keyValueStorage);
	const tokenOrchestrator = new TokenOrchestrator();
	tokenOrchestrator.setAuthTokenStore(authTokenStore);
	tokenOrchestrator.setTokenRefresher(CognitoUserPoolTokenRefresher);

	return {
		getTokens: ({ forceRefresh } = { forceRefresh: false }) =>
			tokenOrchestrator.getTokens({ forceRefresh }),
	};
};
