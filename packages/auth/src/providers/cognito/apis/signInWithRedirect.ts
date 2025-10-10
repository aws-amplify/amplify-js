// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, OAuthConfig } from '@aws-amplify/core';
import {
	AuthAction,
	assertOAuthConfig,
	assertTokenProviderConfig,
	isBrowser,
	urlSafeEncode,
} from '@aws-amplify/core/internals/utils';

import '../utils/oauth/enableOAuthListener';
import { cognitoHostedUIIdentityProviderMap } from '../types/models';
import {
	openAuthSession as _openAuthSession,
	getAuthUserAgentValue,
} from '../../../utils';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';
import { SignInWithRedirectInput } from '../types';
import {
	completeOAuthFlow,
	generateCodeVerifier,
	generateState,
	getRedirectUrl,
	handleFailure,
	oAuthStore,
} from '../utils/oauth';
import { createOAuthError } from '../utils/oauth/createOAuthError';
import { listenForOAuthFlowCancellation } from '../utils/oauth/cancelOAuthFlow';
import { OpenAuthSession } from '../../../utils/types';

/**
 * Signs in a user with OAuth. Redirects the application to an Identity Provider.
 *
 * @param input - The SignInWithRedirectInput object, if empty it will redirect to Cognito HostedUI
 *
 * @throws AuthTokenConfigException - Thrown when the user pool config is invalid.
 * @throws OAuthNotConfigureException - Thrown when the oauth config is invalid.
 */
export async function signInWithRedirect(
	input?: SignInWithRedirectInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	assertOAuthConfig(authConfig);
	oAuthStore.setAuthConfig(authConfig);

	if (!input?.options?.prompt) {
		await assertUserNotAuthenticated();
	}

	let provider = 'COGNITO'; // Default

	if (typeof input?.provider === 'string') {
		provider = cognitoHostedUIIdentityProviderMap[input.provider];
	} else if (input?.provider?.custom) {
		provider = input.provider.custom;
	}

	return oauthSignIn({
		oauthConfig: authConfig.loginWith.oauth,
		clientId: authConfig.userPoolClientId,
		provider,
		customState: input?.customState,
		preferPrivateSession: input?.options?.preferPrivateSession,
		options: {
			loginHint: input?.options?.loginHint,
			lang: input?.options?.lang,
			nonce: input?.options?.nonce,
			prompt: input?.options?.prompt,
		},
		authSessionOpener: input?.options?.authSessionOpener,
	});
}

const oauthSignIn = async ({
	oauthConfig,
	provider,
	clientId,
	customState,
	preferPrivateSession,
	options,
	authSessionOpener,
}: {
	oauthConfig: OAuthConfig;
	provider: string;
	clientId: string;
	customState?: string;
	preferPrivateSession?: boolean;
	options?: SignInWithRedirectInput['options'];
	authSessionOpener?: OpenAuthSession;
}) => {
	const { domain, redirectSignIn, responseType, scopes } = oauthConfig;
	const { loginHint, lang, nonce, prompt } = options ?? {};
	const randomState = generateState();
	const openAuthSession = authSessionOpener || _openAuthSession;

	/* encodeURIComponent is not URL safe, use urlSafeEncode instead. Cognito
	single-encodes/decodes url on first sign in and double-encodes/decodes url
	when user already signed in. Using encodeURIComponent, Base32, Base64 add
	characters % or = which on further encoding becomes unsafe. '=' create issue
	for parsing query params.
	Refer: https://github.com/aws-amplify/amplify-js/issues/5218 */
	const state = customState
		? `${randomState}-${urlSafeEncode(customState)}`
		: randomState;

	const { value, method, toCodeChallenge } = generateCodeVerifier(128);
	const redirectUri = getRedirectUrl(oauthConfig.redirectSignIn);

	if (isBrowser()) oAuthStore.storeOAuthInFlight(true);
	oAuthStore.storeOAuthState(state);
	oAuthStore.storePKCE(value);

	const params = new URLSearchParams([
		['redirect_uri', redirectUri],
		['response_type', responseType],
		['client_id', clientId],
		['identity_provider', provider],
		['scope', scopes.join(' ')],
	]);

	loginHint && params.append('login_hint', loginHint);
	lang && params.append('lang', lang);
	nonce && params.append('nonce', nonce);
	prompt && params.append('prompt', prompt.toLowerCase());
	params.append('state', state);
	if (responseType === 'code') {
		params.append('code_challenge', toCodeChallenge());
		params.append('code_challenge_method', method);
	}

	// Using URL object is not supported in React Native as the `search` property is read-only
	// See: https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/Blob/URL.js
	const oAuthUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;

	// this will only take effect in the following scenarios:
	// 1. the user cancels the OAuth flow on web via back button, and
	// 2. when bfcache is enabled
	listenForOAuthFlowCancellation(oAuthStore);

	// the following is effective only in react-native as openAuthSession resolves only in react-native
	const { type, error, url } =
		(await openAuthSession(oAuthUrl, redirectSignIn, preferPrivateSession)) ??
		{};

	try {
		if (type === 'error') {
			throw createOAuthError(String(error));
		}
		if (type === 'canceled') {
			throw createOAuthError(String(type));
		}
		if (type === 'success' && url) {
			await completeOAuthFlow({
				currentUrl: url,
				clientId,
				domain,
				redirectUri,
				responseType,
				userAgentValue: getAuthUserAgentValue(AuthAction.SignInWithRedirect),
				preferPrivateSession,
			});
		}
	} catch (err) {
		await handleFailure(err);
		// rethrow the error so it can be caught by `await signInWithRedirect()` in react-native
		throw err;
	}
};
