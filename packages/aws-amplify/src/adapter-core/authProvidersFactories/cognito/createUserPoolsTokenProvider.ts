// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthSessionSwitcher,
	DefaultTokenStore,
	TokenOrchestrator,
	createAuthSessionSwitcher,
	refreshAuthTokensWithoutDedupe,
} from '@aws-amplify/auth/cognito';
import {
	AuthConfig,
	KeyValueStorageInterface,
	TokenProvider,
} from '@aws-amplify/core';

/**
 * A {@link TokenProvider} that additionally exposes a non-destructive Cognito
 * session switcher for server contexts.
 *
 * The switcher only permits reading the roster and a membership-checked reorder;
 * the underlying token store (and its destructive methods) is never surfaced.
 */
export interface UserPoolsTokenProvider extends TokenProvider {
	/**
	 * Returns the non-destructive session switcher bound to this provider's
	 * per-request token store.
	 */
	getSessionSwitcher(): AuthSessionSwitcher;
}

/**
 * Creates an object that implements {@link UserPoolsTokenProvider}.
 * @param authConfig The Auth config that the credentials provider needs to function.
 * @param keyValueStorage An object that implements the {@link KeyValueStorageInterface}.
 * @returns An object that implements {@link UserPoolsTokenProvider}.
 */
export const createUserPoolsTokenProvider = (
	authConfig: AuthConfig,
	keyValueStorage: KeyValueStorageInterface,
): UserPoolsTokenProvider => {
	const authTokenStore = new DefaultTokenStore();
	authTokenStore.setAuthConfig(authConfig);
	authTokenStore.setKeyValueStorage(keyValueStorage);
	const tokenOrchestrator = new TokenOrchestrator();
	tokenOrchestrator.setAuthConfig(authConfig);
	tokenOrchestrator.setAuthTokenStore(authTokenStore);
	tokenOrchestrator.setTokenRefresher(refreshAuthTokensWithoutDedupe);

	// Build the switcher over ONLY the read + reorder slice of the store. The
	// raw store stays closure-trapped; only these narrow capabilities escape.
	const sessionSwitcher = createAuthSessionSwitcher(authTokenStore);

	return {
		getTokens: ({ forceRefresh } = { forceRefresh: false }) =>
			tokenOrchestrator.getTokens({ forceRefresh }),
		getSessionSwitcher: () => sessionSwitcher,
	};
};
