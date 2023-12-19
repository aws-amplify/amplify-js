// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthConfig } from '@aws-amplify/core';
import {
	AuthAction,
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { oAuthStore } from './oAuthStore';
import { completeOAuthFlow } from './completeOAuthFlow';
import { getAuthUserAgentValue } from '../../../../utils';
import { getRedirectUrl } from './getRedirectUrl';

export const attemptCompleteOAuthFlow = async (
	authConfig: AuthConfig['Cognito']
): Promise<void> => {
	try {
		assertTokenProviderConfig(authConfig);
		assertOAuthConfig(authConfig);
		oAuthStore.setAuthConfig(authConfig);
	} catch (_) {
		// no-op
		// This should not happen as Amplify singleton checks the oauth config key
		// unless the oauth config object doesn't contain required properties
		return;
	}

	// No inflight OAuth
	if (!(await oAuthStore.loadOAuthInFlight())) {
		return;
	}

	try {
		const currentUrl = window.location.href;
		const { loginWith, userPoolClientId } = authConfig;
		const { domain, redirectSignIn, responseType } = loginWith.oauth;
		const redirectUri = getRedirectUrl(redirectSignIn);

		await completeOAuthFlow({
			currentUrl,
			clientId: userPoolClientId,
			domain,
			redirectUri,
			responseType,
			userAgentValue: getAuthUserAgentValue(AuthAction.SignInWithRedirect),
		});
	} catch (err) {
		// no-op
		// Possible errors:
		// 1. redirect url has `error` query param - error sent via Hub
		// 2. validateState - error sent via Hub
		// 3. fetch call to `/oauth2/token` - error sent via Hub
	}
};
