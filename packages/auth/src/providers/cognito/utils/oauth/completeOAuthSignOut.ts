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
	// that user's namespace + roster entry. A blanket clearTokens() would remove
	// AuthUserList and orphan every other parked session (multi-session support).
	const tokens = await tokenStore.loadTokens();
	const activeUsername =
		tokens?.username ?? (await tokenStore.getLastAuthUser());
	const activeUserId = tokens?.idToken?.payload?.sub as string | undefined;

	await tokenStore.clearTokensForUser(activeUsername);
	const removeResult = await tokenStore.removeSession(activeUsername);
	await clearCredentials();

	await dispatchSignOutBoundaryEvents(
		tokenStore,
		activeUserId
			? { username: activeUsername, userId: activeUserId }
			: undefined,
		removeResult,
	);
};
