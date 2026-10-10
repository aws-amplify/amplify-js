// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';
import type { TokenOrchestrator } from '../../tokenProvider';

export const completeOAuthSignOut = async (
	store: DefaultOAuthStore,
	tokenOrchestrator: TokenOrchestrator,
	clearCredentials: () => Promise<void>,
) => {
	await store.clearOAuthData();
	// The orchestrator and the credential-clearing callback are resolved from the
	// caller's `AmplifyContext` in `signOut` and threaded down through
	// `handleOAuthSignOut`, so both target the context's own stores. This path is
	// only ever reached in-process from `signOut`; OAuth sign-IN completion after
	// a full-page redirect is a different flow (`completeOAuthFlow`, driven by
	// `enableOAuthListener`).
	tokenOrchestrator.clearTokens();
	await clearCredentials();
	Hub.dispatch('auth', { event: 'signedOut' }, 'Auth', AMPLIFY_SYMBOL);
};
