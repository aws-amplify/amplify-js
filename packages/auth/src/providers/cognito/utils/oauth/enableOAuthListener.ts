// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Hub,
	ResourcesConfig,
	getGlobalContext,
	hasGlobalContext,
} from '@aws-amplify/core';
import { isBrowser } from '@aws-amplify/core/internals/utils';

import { attemptCompleteOAuthFlow } from './attemptCompleteOAuthFlow';

// Synchronous re-entry guard for the OAuth completion side effect (PR #14925).
//
// Phase C4 removed the core singleton's fire-at-most-once `notifyOAuthListener`
// (it invoked the listener then nulled `oAuthListener`, so a completed flow was
// never re-triggered by a later `Amplify.configure()`). It was replaced by a
// permanent `configure` Hub subscription PLUS an import-time catch-up call —
// both of which invoke `attemptCompleteOAuthFlow`. That function's only guard is
// the *async* `await oAuthStore.loadOAuthInFlight()`, and both the inflight flag
// and the URL `code` are cleared only at the END of `completeOAuthFlow` (after
// the token-endpoint fetch). So if a second trigger fires while the first
// invocation is still mid-fetch — React StrictMode double-invoke, HMR, or any
// double `Amplify.configure()` — both pass the async guard and POST the same
// single-use authorization code; the second exchange returns `invalid_grant`,
// and `handleFailure` dispatches a spurious `signInWithRedirect` FAILURE Hub
// event even though sign-in actually succeeded.
//
// Contract: at most one completion per cycle. We claim this flag SYNCHRONOUSLY
// (before any `await`), so concurrent triggers collapse to a single
// `attemptCompleteOAuthFlow` execution. The flag is released once that execution
// settles, so — unlike the old once-ever singleton — harmless steady-state
// re-fires after a completed flow stay possible: they simply no-op via
// `loadOAuthInFlight` (whose flag is now cleared). This preserves the old
// observable contract (a single-use auth code is exchanged at most once) while
// only adding the missing protection against *concurrent* re-entry.
let isHandlingOAuthFlow = false;

const attemptCompleteOAuthFlowOnce = (
	cognitoConfig: Parameters<typeof attemptCompleteOAuthFlow>[0],
) => {
	if (isHandlingOAuthFlow) {
		return;
	}
	isHandlingOAuthFlow = true;
	// `attemptCompleteOAuthFlow` never rejects (it routes errors through
	// `handleFailure`); `Promise.resolve` keeps the guard robust regardless of
	// the returned value and releases it once the async work settles.
	Promise.resolve(attemptCompleteOAuthFlow(cognitoConfig)).finally(() => {
		isHandlingOAuthFlow = false;
	});
};

// Attach the side effect for handling the completion of an inflight OAuth flow.
// This side effect works only on Web.
//
// Phase C4: the singleton `ADD_OAUTH_LISTENER` hook was removed from core. The
// listener is now driven entirely by the `configure` Hub event that
// `Amplify.configure()` publishes (after it sets the global context), which
// preserves the previous browser behavior: the OAuth flow is completed as soon
// as Amplify is configured with an OAuth-enabled Cognito config.
if (isBrowser()) {
	Hub.listen('core', ({ payload }) => {
		if (payload.event === 'configure') {
			const cognitoConfig = (payload.data as ResourcesConfig | undefined)?.Auth
				?.Cognito;
			if (cognitoConfig?.loginWith?.oauth) {
				attemptCompleteOAuthFlowOnce(cognitoConfig);
			}
		}
	});

	// Catch-up: `Amplify.configure()` may have run before this module was
	// imported (dynamic imports / code-splitting), in which case the 'configure'
	// Hub event already fired and was missed. If a global context configured with
	// OAuth already exists, attempt completion now.
	if (hasGlobalContext()) {
		const cognitoConfig = getGlobalContext().resourcesConfig?.Auth?.Cognito;
		if (cognitoConfig?.loginWith?.oauth) {
			attemptCompleteOAuthFlowOnce(cognitoConfig);
		}
	}
}

// required to present for module loaders
export {};
