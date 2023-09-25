// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub, defaultStorage, OAuthConfig } from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	assertOAuthConfig,
	assertTokenProviderConfig,
	getAmplifyUserAgent,
	isBrowser,
	urlSafeEncode,
	USER_AGENT_HEADER,
	urlSafeDecode,
} from '@aws-amplify/core/internals/utils';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { CognitoUserPoolsTokenProvider } from '../tokenProvider';
import { cognitoHostedUIIdentityProviderMap } from '../types/models';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { AuthError } from '../../../errors/AuthError';
import { AuthErrorTypes } from '../../../types/Auth';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { authErrorMessages } from '../../../Errors';
import { openAuthSession } from '../../../utils';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';
import { SignInWithRedirectInput } from '../types';
import { generateCodeVerifier, generateState } from '../utils/oauth';
import { getCurrentUser } from './getCurrentUser';

/**
 * Signs in a user with OAuth. Redirects the application to an Identity Provider.
 *
 * @param input - The SignInWithRedirectInput object, if empty it will redirect to Cognito HostedUI
 *
 * TODO: add config errors
 */
export async function signInWithRedirect(
	input?: SignInWithRedirectInput
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	assertOAuthConfig(authConfig);
	store.setAuthConfig(authConfig);
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
	});
}

const store = new DefaultOAuthStore(defaultStorage);

async function oauthSignIn({
	oauthConfig,
	provider,
	clientId,
	customState,
}: {
	oauthConfig: OAuthConfig;
	provider: string;
	clientId: string;
	customState?: string;
}) {
	const { domain, redirectSignIn, responseType, scopes } = oauthConfig;
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

	store.storeOAuthInFlight(true);
	store.storeOAuthState(state);
	store.storePKCE(value);

	const queryString = Object.entries({
		redirect_uri: redirectSignIn[0], // TODO(v6): add logic to identity the correct url
		response_type: responseType,
		client_id: clientId,
		identity_provider: provider,
		scope: scopes.join(' '),
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
	const { type, url } = (await openAuthSession(oAuthUrl, redirectSignIn)) ?? {};
	if (type === 'success' && url) {
		handleAuthResponse({
			currentUrl: url,
			clientId,
			domain,
			redirectUri: redirectSignIn[0],
			responseType,
			userAgentValue: getAmplifyUserAgent(),
		});
	}
}

async function handleCodeFlow({
	currentUrl,
	userAgentValue,
	clientId,
	redirectUri,
	domain,
}: {
	currentUrl: string;
	userAgentValue: string;
	clientId: string;
	redirectUri: string;
	domain: string;
}) {
	/* Convert URL into an object with parameters as keys
{ redirect_uri: 'http://localhost:3000/', response_type: 'code', ...} */
	const url = new URL(currentUrl);
	let validatedState: string;
	try {
		validatedState = await validateStateFromURL(url);
	} catch (err) {
		invokeAndClearPromise();
		// clear temp values
		await store.clearOAuthInflightData();
		return;
	}
	const code = url.searchParams.get('code');

	const currentUrlPathname = url.pathname || '/';
	const redirectUriPathname = new URL(redirectUri).pathname || '/';

	if (!code || currentUrlPathname !== redirectUriPathname) {
		return;
	}

	const oAuthTokenEndpoint = 'https://' + domain + '/oauth2/token';

	// TODO(v6): check hub events
	// dispatchAuthEvent(
	// 	'codeFlow',
	// 	{},
	// 	`Retrieving tokens from ${oAuthTokenEndpoint}`
	// );

	const codeVerifier = await store.loadPKCE();

	const oAuthTokenBody = {
		grant_type: 'authorization_code',
		code,
		client_id: clientId,
		redirect_uri: redirectUri,
		...(codeVerifier ? { code_verifier: codeVerifier } : {}),
	};

	const body = Object.entries(oAuthTokenBody)
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

	const {
		access_token,
		refresh_token,
		id_token,
		error,
		token_type,
		expires_in,
	} = await (
		await fetch(oAuthTokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				[USER_AGENT_HEADER]: userAgentValue,
			},
			body,
		})
	).json();

	if (error) {
		invokeAndClearPromise();

		Hub.dispatch(
			'auth',
			{ event: 'signInWithRedirect_failure' },
			'Auth',
			AMPLIFY_SYMBOL
		);
		throw new AuthError({
			message: error,
			name: AuthErrorCodes.OAuthSignInError,
			recoverySuggestion: authErrorMessages.oauthSignInError.log,
		});
	}

	await store.clearOAuthInflightData();

	await cacheCognitoTokens({
		AccessToken: access_token,
		IdToken: id_token,
		RefreshToken: refresh_token,
		TokenType: token_type,
		ExpiresIn: expires_in,
	});

	await store.storeOAuthSignIn(true);

	if (isCustomState(validatedState)) {
		Hub.dispatch(
			'auth',
			{
				event: 'customOAuthState',
				data: urlSafeDecode(getCustomState(validatedState)),
			},
			'Auth',
			AMPLIFY_SYMBOL
		);
	}
	Hub.dispatch('auth', { event: 'signInWithRedirect' }, 'Auth', AMPLIFY_SYMBOL);
	Hub.dispatch(
		'auth',
		{ event: 'signedIn', data: await getCurrentUser() },
		'Auth',
		AMPLIFY_SYMBOL
	);
	clearHistory(redirectUri);
	invokeAndClearPromise();
	return;
}

async function handleImplicitFlow({
	currentUrl,
	redirectUri,
}: {
	currentUrl: string;
	redirectUri: string;
}) {
	// hash is `null` if `#` doesn't exist on URL

	const url = new URL(currentUrl);

	const { idToken, accessToken, state, tokenType, expiresIn } = (
		url.hash || '#'
	)
		.substring(1) // Remove # from returned code
		.split('&')
		.map(pairings => pairings.split('='))
		.reduce((accum, [k, v]) => ({ ...accum, [k]: v }), {
			idToken: undefined,
			accessToken: undefined,
			state: undefined,
			tokenType: undefined,
			expiresIn: undefined,
		});

	await store.clearOAuthInflightData();
	try {
		validateState(state);
	} catch (error) {
		invokeAndClearPromise();
		return;
	}

	await cacheCognitoTokens({
		AccessToken: accessToken,
		IdToken: idToken,
		TokenType: tokenType,
		ExpiresIn: expiresIn,
	});

	await store.storeOAuthSignIn(true);
	if (isCustomState(state)) {
		Hub.dispatch(
			'auth',
			{
				event: 'customOAuthState',
				data: urlSafeDecode(getCustomState(state)),
			},
			'Auth',
			AMPLIFY_SYMBOL
		);
	}
	Hub.dispatch('auth', { event: 'signInWithRedirect' }, 'Auth', AMPLIFY_SYMBOL);
	Hub.dispatch(
		'auth',
		{ event: 'signedIn', data: await getCurrentUser() },
		'Auth',
		AMPLIFY_SYMBOL
	);
	clearHistory(redirectUri);
	invokeAndClearPromise();
}

async function handleAuthResponse({
	currentUrl,
	userAgentValue,
	clientId,
	redirectUri,
	responseType,
	domain,
}: {
	currentUrl: string;
	userAgentValue: string;
	clientId: string;
	redirectUri: string;
	responseType: string;
	domain: string;
}) {
	try {
		const urlParams = new URL(currentUrl);
		const error = urlParams.searchParams.get('error');
		const error_description = urlParams.searchParams.get('error_description');

		if (error) {
			Hub.dispatch(
				'auth',
				{ event: 'signInWithRedirect_failure' },
				'Auth',
				AMPLIFY_SYMBOL
			);
			throw new AuthError({
				message: error_description ?? '',
				name: AuthErrorCodes.OAuthSignInError,
				recoverySuggestion: authErrorMessages.oauthSignInError.log,
			});
		}

		if (responseType === 'code') {
			return await handleCodeFlow({
				currentUrl,
				userAgentValue,
				clientId,
				redirectUri,
				domain,
			});
		} else {
			return await handleImplicitFlow({
				currentUrl,
				redirectUri,
			});
		}
	} catch (e) {
		throw e;
	}
}

async function validateStateFromURL(urlParams: URL): Promise<string> {
	if (!urlParams) {
	}
	const returnedState = urlParams.searchParams.get('state');

	validateState(returnedState);
	return returnedState;
}

function validateState(state?: string | null): asserts state {
	let savedState: string | undefined | null;

	store.loadOAuthState().then(resp => {
		savedState = resp;
	});

	// This is because savedState only exists if the flow was initiated by Amplify
	if (savedState && state && savedState !== state) {
		throw new AuthError({
			name: AuthErrorTypes.OAuthSignInError,
			message: 'An error occurred while validating the state',
			recoverySuggestion: 'Try to initiate an OAuth flow from Amplify',
		});
	}
}

async function parseRedirectURL() {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	try {
		assertTokenProviderConfig(authConfig);
		store.setAuthConfig(authConfig);
	} catch (_err) {
		// Token provider not configure nothing to do
		return;
	}

	// No OAuth inflight doesnt need to parse the url
	if (!(await store.loadOAuthInFlight())) {
		return;
	}
	try {
		assertOAuthConfig(authConfig);
	} catch (err) {
		// TODO(v6): this should warn you have signInWithRedirect but is not configured
		return;
	}

	try {
		const currentUrl = window.location.href;
		const { loginWith, userPoolClientId } = authConfig;
		const { domain, redirectSignIn, responseType } = loginWith.oauth;

		handleAuthResponse({
			currentUrl,
			clientId: userPoolClientId,
			domain,
			redirectUri: redirectSignIn[0],
			responseType,
			userAgentValue: getAmplifyUserAgent(),
		});
	} catch (err) {
		// is ok if there is not OAuthConfig
	}
}

function urlListener() {
	// Listen configure to parse url
	parseRedirectURL();
	Hub.listen('core', capsule => {
		if (capsule.payload.event === 'configure') {
			parseRedirectURL();
		}
	});
}

isBrowser() && urlListener();

// This has a reference for listeners that requires to be notified, TokenOrchestrator use this for load tokens
let resolveInflightPromise = () => {};

const invokeAndClearPromise = () => {
	resolveInflightPromise();
	resolveInflightPromise = () => {};
};

isBrowser() &&
	CognitoUserPoolsTokenProvider.setWaitForInflightOAuth(
		() =>
			new Promise(async (res, _rej) => {
				if (!(await store.loadOAuthInFlight())) {
					res();
				} else {
					resolveInflightPromise = res;
				}
				return;
			})
	);

function clearHistory(redirectUri: string) {
	if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
		window.history.replaceState({}, '', redirectUri);
	}
}

function isCustomState(state: string): Boolean {
	return /-/.test(state);
}

function getCustomState(state: string): string {
	return state.split('-').splice(1).join('-');
}
