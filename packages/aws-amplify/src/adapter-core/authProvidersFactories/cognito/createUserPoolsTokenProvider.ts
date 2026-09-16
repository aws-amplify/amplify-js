// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DefaultTokenStore,
	TokenOrchestrator,
	refreshAuthTokensWithoutDedupe,
	registerContextTokenOrchestrator,
} from '@aws-amplify/auth/cognito';
import {
	AuthConfig,
	KeyValueStorageInterface,
	TokenProvider,
} from '@aws-amplify/core';

/**
 * Creates an object that implements {@link TokenProvider}.
 * @param authConfig The Auth config that the credentials provider needs to function.
 * @param keyValueStorage An object that implements the {@link KeyValueStorageInterface}.
 * @returns An object that implements {@link TokenProvider}.
 */
export const createUserPoolsTokenProvider = (
	authConfig: AuthConfig,
	keyValueStorage: KeyValueStorageInterface,
): TokenProvider => {
	const authTokenStore = new DefaultTokenStore();
	authTokenStore.setAuthConfig(authConfig);
	authTokenStore.setKeyValueStorage(keyValueStorage);
	const tokenOrchestrator = new TokenOrchestrator();
	tokenOrchestrator.setAuthConfig(authConfig);
	tokenOrchestrator.setAuthTokenStore(authTokenStore);
	tokenOrchestrator.setTokenRefresher(refreshAuthTokensWithoutDedupe);

	const provider: TokenProvider = {
		getTokens: ({ forceRefresh } = { forceRefresh: false }) =>
			tokenOrchestrator.getTokens({ forceRefresh }),
	};

	// Register the per-context orchestrator so token writes performed through a
	// local context (e.g. `createAmplifyContext`) can be routed to this
	// write-capable orchestrator instead of the global singleton.
	registerContextTokenOrchestrator(provider, tokenOrchestrator);

	return provider;
};
