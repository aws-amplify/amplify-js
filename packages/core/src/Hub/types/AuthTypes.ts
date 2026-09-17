// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

interface AuthUser {
	username: string;
	userId: string;
}
interface AuthError {
	name: string;
	message: string;
	recoverySuggestion?: string;
}
export type AuthHubEventData =
	/** Dispatched when a user signs in with an oauth provider such as Google. */
	| { event: 'signInWithRedirect' }
	/** Dispatched when there is an error in the oauth flow process. */
	| {
			event: 'signInWithRedirect_failure';
			data: { error?: AuthError };
	  }
	/** Dispatched when auth tokens are successfully refreshed. */
	| { event: 'tokenRefresh'; data?: AuthUser }
	/** Dispatched when there is an error in the refresh of tokens. */
	| { event: 'tokenRefresh_failure'; data: { error?: AuthError } }
	/** Dispatched when there is a customState passed in the options of the `signInWithRedirect` API. */
	| { event: 'customOAuthState'; data: string }
	/** Dispatched when the active user pointer transitions from none to some —
	 * the first sign-in, or reactivating a parked session after a sign-out. */
	| { event: 'signedIn'; data: AuthUser }
	/** Dispatched on every active-user sign-out. This fires EVEN when parked
	 * sessions remain in the roster; it signals that no user is active, NOT that
	 * the roster is empty. */
	| { event: 'signedOut'; data?: AuthUser }
	/** Dispatched when a user is added to the roster on sign-in. */
	| { event: 'userSignedIn'; data: AuthUser }
	/** Dispatched when the active user pointer moves between users. */
	| { event: 'switchActiveUser'; data: AuthUser }
	/** Dispatched when a user is removed from the roster on sign-out. */
	| { event: 'userSignedOut'; data: AuthUser };
