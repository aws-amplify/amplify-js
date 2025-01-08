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
import { getAuthUserAgentValue, openAuthSession } from '../../../utils';
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
	await assertUserNotAuthenticated();

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
		},
	});
}

const oauthSignIn = async ({
	oauthConfig,
	provider,
	clientId,
	customState,
	preferPrivateSession,
	options,
}: {
	oauthConfig: OAuthConfig;
	provider: string;
	clientId: string;
	customState?: string;
	preferPrivateSession?: boolean;
	options?: SignInWithRedirectInput['options'];
}) => {
	const { domain, redirectSignIn, responseType, scopes } = oauthConfig;
	const { loginHint, lang, nonce } = options ?? {};
	const randomState = generateState();

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

	const queryString = Object.entries({
		redirect_uri: redirectUri,
		response_type: responseType,
		client_id: clientId,
		identity_provider: provider,
		scope: scopes.join(' '),
		// eslint-disable-next-line camelcase
		...(loginHint && { login_hint: loginHint }),
		...(lang && { lang }),
		...(nonce && { nonce }),
		state,
		...(responseType === 'code' && {
			code_challenge: toCodeChallenge(),
			code_challenge_method: method,
		}),
	})
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

	// TODO(v6): use URL object instead
	const oAuthUrl = `https://${domain}/oauth2/authorize?${queryString}`;

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
