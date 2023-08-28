// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO Need to update types of data
export type AuthHubEventData =
	| { event: 'signInWithRedirect' } // Used when an oauth flow is done
	| { event: 'tokenRefresh' } // used when a token is refreshed
	| { event: 'tokenRefresh_failure' } // used when the refresh of tokens failed
	| { event: 'customOAuthState' }
	| { event: 'customState_failure' };
