// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../../tokenProvider';

export const completeOAuthSignOut = async (store: DefaultOAuthStore) => {
	await store.clearOAuthData();
	// The OAuth sign-out completes after a full-page redirect, so no
	// AmplifyContext survives to resolve a per-context orchestrator from; this
	// path is global-only by construction (see `enableOAuthListener`, which uses
	// `getGlobalContext()`).
	tokenOrchestrator.clearTokens();
	await clearCredentials();
	Hub.dispatch('auth', { event: 'signedOut' }, 'Auth', AMPLIFY_SYMBOL);
};
