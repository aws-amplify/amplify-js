// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../errors/AuthError';
import { USER_NOT_SIGNED_IN_EXCEPTION } from '../../../errors/constants';
import { tokenOrchestrator } from '../tokenProvider';

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
	// Roster membership is required; the roster may hold parked sessions while no
	// user is active (empty pointer).
	const list = await tokenStore.getAuthUserList();

	if (!list.includes(username)) {
		throw new AuthError({
			name: USER_NOT_SIGNED_IN_EXCEPTION,
			message: `Cannot switch to user "${username}": no signed-in session found.`,
			recoverySuggestion:
				'Please make sure the user has signed in before switching to it.',
		});
	}

	// Read the RAW active pointer BEFORE mutating so we can both no-op when the
	// target is already active and pick the correct boundary event below.
	const activePointer = await tokenStore.getActiveUsername();

	// Already the active user; nothing to switch and no event to emit.
	if (activePointer === username) {
		return;
	}

	// Promote the target user to the front of the roster and set it active.
	await tokenStore.addActiveSession(username);

	// Bust the previous active user's identity-pool credentials so subsequent
	// credential requests resolve against the newly active user.
	await clearCredentials();

	// Resolve the now-active user's identity from their stored id token (no
	// refresh). Skip the dispatch if the id token is undecodable — emitting an
	// event with userId:'' would violate the AuthUser contract.
	const idToken = await tokenStore.getStoredIdToken(username);
	const userId = (idToken?.payload?.sub as string) ?? '';

	if (!userId) {
		return;
	}

	const data = { username, userId };

	if (!activePointer) {
		// No active user before (empty pointer — activating a parked session after
		// a sign-out): this is a signedIn boundary, not a switch.
		Hub.dispatch(
			'auth',
			{
				event: 'signedIn',
				data,
			},
			'Auth',
			AMPLIFY_SYMBOL,
		);
	} else {
		// A different user was active -> the active pointer moved between users.
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
}
