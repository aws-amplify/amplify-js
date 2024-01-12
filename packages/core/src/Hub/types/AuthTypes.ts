// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type AuthUser = {
	username: string;
	userId: string;
};
type AuthError = {
	name: string;
	message: string;
	recoverySuggestion?: string;
};
export type AuthHubEventData =
	/** Dispatched when a user signs in with an oauth provider such as Google.*/
	| { event: 'signInWithRedirect' }
	/** Dispatched when there is an error in the oauth flow process.*/
	| {
			event: 'signInWithRedirect_failure';
			data: { error?: AuthError };
	  }
	/** Dispatched when auth tokens are successfully refreshed.*/
	| { event: 'tokenRefresh' }
	/** Dispatched when there is an error in the refresh of tokens.*/
	| { event: 'tokenRefresh_failure'; data: { error?: AuthError } }
	/** Dispatched when there is a customState passed in the options of the `signInWithRedirect` API.*/
	| { event: 'customOAuthState'; data: string }
	/** Dispatched when the user is signed-in.*/
	| { event: 'signedIn'; data: AuthUser }
	/** Dispatched after the user calls the `signOut` API successfully.*/
	| { event: 'signedOut' };
