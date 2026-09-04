// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../errors/AuthError';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../errors/constants';

import { AuthSessionSwitcher, AuthTokenStore } from './types';

/**
 * The subset of a token store the switcher is allowed to touch: only reads and
 * the roster reorder. This narrowing (via `Pick`) guarantees, by construction,
 * that the switcher cannot reach any destructive store method.
 */
type SwitchableTokenStore = Pick<
	AuthTokenStore,
	'getAuthUserList' | 'getStoredIdToken' | 'addActiveSession'
>;

/**
 * Builds a non-destructive {@link AuthSessionSwitcher} over a token store.
 *
 * The returned object can only read the roster / stored id tokens and perform a
 * membership-checked reorder. It deliberately does not close over — nor expose —
 * any destructive store method, so it is safe to surface across a server context
 * boundary.
 *
 * @param store - The (read + reorder) slice of the token store to wrap.
 * @returns A narrow session switcher.
 */
export const createAuthSessionSwitcher = (
	store: SwitchableTokenStore,
): AuthSessionSwitcher => ({
	listSessionUsernames: () => store.getAuthUserList(),
	getStoredIdToken: username => store.getStoredIdToken(username),
	setActiveSession: async username => {
		// Roster is ordered with the active user first.
		const list = await store.getAuthUserList();

		if (!list.includes(username)) {
			throw new AuthError({
				name: USER_NOT_SIGNED_IN_EXCEPTION,
				message: `Cannot switch to user "${username}": no signed-in session found.`,
				recoverySuggestion:
					'Please make sure the user has signed in before switching to it.',
			});
		}

		// Membership confirmed: promote the target to the front of the roster.
		// addActiveSession only reorders an existing member here; it never adds a
		// non-signed-in user (guarded above) and never deletes tokens.
		await store.addActiveSession(username);
	},
});
