// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import type { AuthTokenStore } from '../tokenProvider/types';

/**
 * Dispatches the sign-out boundary Hub events shared across every sign-out path
 * (apis/signOut, OAuth sign-out, and terminal token-refresh failure) so they
 * stay consistent.
 *
 * Event contract (all payloads are exactly `{ username, userId }`):
 * - `userSignedOut` fires whenever a resolvable active user was removed; it
 *   tracks roster membership.
 * - `signedOut` fires only when the roster transitioned to empty.
 * - `switchActiveUser` fires when the active pointer moved to a promoted parked
 *   user; its identity is resolved from the promoted user's STORED id token
 *   WITHOUT triggering a token refresh.
 *
 * @param tokenStore - The token store used to resolve the promoted user's
 * identity from their stored id token (injected to avoid a tokenProvider import
 * cycle).
 * @param signedOutUser - The user that was signed out, or `undefined` when no
 * active user could be resolved before removal.
 * @param removeResult - The result of `removeSession`: the promoted roster head
 * (if any) and whether the roster is now empty.
 */
export async function dispatchSignOutBoundaryEvents(
	tokenStore: AuthTokenStore,
	signedOutUser: { username: string; userId: string } | undefined,
	removeResult: { newActiveUser?: string; isEmpty: boolean },
): Promise<void> {
	// userSignedOut tracks roster membership: fires for every sign-out where we
	// had a resolvable active user.
	if (signedOutUser) {
		Hub.dispatch(
			'auth',
			{ event: 'userSignedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);
	}

	if (removeResult.isEmpty) {
		// roster went non-empty -> empty: emit the signedOut boundary event.
		Hub.dispatch(
			'auth',
			{ event: 'signedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);

		return;
	}

	// active pointer moved to a promoted roster member; resolve the new active
	// user's identity from their stored id token (no refresh) and announce it.
	const promoted = await resolvePromotedUser(
		tokenStore,
		removeResult.newActiveUser,
	);
	Hub.dispatch(
		'auth',
		{ event: 'switchActiveUser', data: promoted },
		'Auth',
		AMPLIFY_SYMBOL,
	);
}

/**
 * Resolves the promoted user's identity from their STORED id token without
 * triggering a token refresh. Falls back to an empty userId (rather than
 * throwing) when the id token cannot be read or decoded.
 *
 * @param tokenStore - The token store used to read the promoted user's stored
 * id token.
 * @param newActiveUser - The promoted roster head (may be undefined).
 * @returns The `{ username, userId }` payload for the `switchActiveUser` event.
 */
async function resolvePromotedUser(
	tokenStore: AuthTokenStore,
	newActiveUser: string | undefined,
): Promise<{ username: string; userId: string }> {
	const username = newActiveUser ?? '';
	try {
		const idToken = await tokenStore.getStoredIdToken(username);

		if (idToken) {
			const { sub } = idToken.payload ?? {};

			return { username, userId: (sub as string) ?? '' };
		}
	} catch (err) {
		// Fall through to the empty-userId fallback below rather than throwing.
	}

	return { username, userId: '' };
}
