// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { clearCredentials } from '@aws-amplify/core';

import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../../tokenProvider';
import { dispatchSignOutBoundaryEvents } from '../dispatchSignOutHubEvents';

export const completeOAuthSignOut = async (store: DefaultOAuthStore) => {
	await store.clearOAuthData();

	const tokenStore = tokenOrchestrator.getTokenStore();
	// Resolve the active user from STORED tokens (no refresh), then remove ONLY
	// that user's namespace + roster entry and clear the active pointer. A
	// blanket clearTokens() would remove AuthUserList and orphan every other
	// parked session (multi-session support).
	const activeUsername = await tokenStore.getLastAuthUser();
	const storedIdToken = await tokenStore.getStoredIdToken(activeUsername);
	const activeUserId = storedIdToken?.payload?.sub as string | undefined;
	const signedOutUser = activeUserId
		? { username: activeUsername, userId: activeUserId }
		: undefined;

	await tokenStore.clearTokensForUser(activeUsername);
	await tokenStore.removeSession(activeUsername);
	await tokenStore.clearActiveUser();
	await clearCredentials();

	// userSignedOut (when resolvable) then signedOut ALWAYS; never switchActiveUser.
	await dispatchSignOutBoundaryEvents(signedOutUser);
};
