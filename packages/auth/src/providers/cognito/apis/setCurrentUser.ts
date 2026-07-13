// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../errors/AuthError';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../errors/constants';
import { tokenOrchestrator } from '../tokenProvider';

import { getCurrentUser } from './internal/getCurrentUser';

/**
 * Switches the active user to a different signed-in user without requiring
 * re-authentication.
 *
 * The target user must already be part of the current session roster (i.e.
 * have signed in previously and not signed out). The active user pointer is
 * moved to the front of the roster and the previous active user's identity-pool
 * credentials are cleared so subsequent credential requests resolve against the
 * newly active user.
 *
 * @param username - The username of the signed-in user to switch to.
 * @returns void
 * @throws {@link AuthError} - Thrown with name `UserNotSignedInException` when
 * the given username has no signed-in session in the roster.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function setCurrentUser(username: string): Promise<void> {
	const tokenStore = tokenOrchestrator.getTokenStore();
	// Roster is ordered with the active user first.
	const list = await tokenStore.getAuthUserList();

	if (!list.includes(username)) {
		throw new AuthError({
			name: USER_NOT_SIGNED_IN_EXCEPTION,
			message: `Cannot switch to user "${username}": no signed-in session found.`,
			recoverySuggestion:
				'Please make sure the user has signed in before switching to it.',
		});
	}

	// Already the active user; nothing to switch and no event to emit.
	if (list[0] === username) {
		return;
	}

	// Promote the target user to the front of the roster (new active user).
	await tokenStore.addActiveSession(username);

	// Bust the previous active user's identity-pool credentials so subsequent
	// credential requests resolve against the newly active user.
	await clearCredentials();

	// Resolve the now-active user for the event payload.
	const currentUser = await getCurrentUser(Amplify);
	const data = {
		username: currentUser.username,
		userId: currentUser.userId,
	};

	// switchActiveUser fires when the active pointer moves between users.
	Hub.dispatch(
		'auth',
		{
			event: 'switchActiveUser',
			data,
		},
		'Auth',
		AMPLIFY_SYMBOL,
	);
}
