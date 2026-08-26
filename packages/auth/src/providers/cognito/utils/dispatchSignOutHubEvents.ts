// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

/**
 * Dispatches the sign-out boundary Hub events shared across every sign-out path
 * (apis/signOut, OAuth sign-out, and terminal token-refresh failure) so they
 * stay consistent.
 *
 * Under the no-promotion sign-out model a sign-out NEVER promotes a parked
 * session, so no `switchActiveUser` event is ever emitted here (that resolution
 * logic has been removed). Parked sessions may remain in the roster; sign-out
 * only clears the ACTIVE pointer.
 *
 * Event contract:
 * - `userSignedOut` (payload `{ username, userId }`) fires whenever a resolvable
 *   signed-out user was captured; skipped when the identity is unresolvable
 *   (missing/undecodable id token) to avoid violating the AuthUser contract.
 * - `signedOut` fires ALWAYS — its data is the signed-out user when resolvable,
 *   otherwise undefined (no data).
 *
 * @param signedOutUser - The user that was signed out, or `undefined` when no
 * active user could be resolved before removal.
 */
export async function dispatchSignOutBoundaryEvents(
	signedOutUser: { username: string; userId: string } | undefined,
): Promise<void> {
	// userSignedOut tracks the specific user leaving: fires only when we had a
	// resolvable signed-out identity.
	if (signedOutUser) {
		Hub.dispatch(
			'auth',
			{ event: 'userSignedOut', data: signedOutUser },
			'Auth',
			AMPLIFY_SYMBOL,
		);
	}

	// signedOut is the sign-out boundary and fires ALWAYS under the no-promotion
	// model, regardless of any parked sessions remaining in the roster.
	Hub.dispatch(
		'auth',
		{ event: 'signedOut', data: signedOutUser },
		'Auth',
		AMPLIFY_SYMBOL,
	);
}
