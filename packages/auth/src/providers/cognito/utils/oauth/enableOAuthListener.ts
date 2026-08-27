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
				attemptCompleteOAuthFlow(cognitoConfig);
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
			attemptCompleteOAuthFlow(cognitoConfig);
		}
	}
}

// required to present for module loaders
export {};
