// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub, defaultStorage, OAuthConfig } from '@aws-amplify/core';
import {
	AuthAction,
	AMPLIFY_SYMBOL,
	assertOAuthConfig,
	assertTokenProviderConfig,
	isBrowser,
	urlSafeEncode,
	USER_AGENT_HEADER,
	urlSafeDecode,
	decodeJWT,
	AmplifyUrl,
} from '@aws-amplify/core/internals/utils';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { cognitoUserPoolsTokenProvider } from '../tokenProvider';
import { cognitoHostedUIIdentityProviderMap } from '../types/models';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { AuthError } from '../../../errors/AuthError';
import { AuthErrorTypes } from '../../../types/Auth';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { authErrorMessages } from '../../../Errors';
import { getAuthUserAgentValue, openAuthSession } from '../../../utils';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';
import { SignInWithRedirectInput } from '../types';
import { generateCodeVerifier, generateState } from '../utils/oauth';
import { getCurrentUser } from './getCurrentUser';
import { getRedirectUrl } from '../utils/oauth/getRedirectUrl';

/**
 * Signs in a user with OAuth. Redirects the application to an Identity Provider.
 *
 * @param input - The SignInWithRedirectInput object, if empty it will redirect to Cognito HostedUI
 *
 * @throws AuthTokenConfigException - Thrown when the userpool config is invalid.
 * @throws OAuthNotConfigureException - Thrown when the oauth config is invalid.
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
		preferPrivateSession: input?.options?.preferPrivateSession,
	});
}

export const store = new DefaultOAuthStore(defaultStorage);

export async function oauthSignIn({
	oauthConfig,
	provider,
	clientId,
	customState,
	preferPrivateSession,
}: {
	oauthConfig: OAuthConfig;
	provider: string;
	clientId: string;
	customState?: string;
	preferPrivateSession?: boolean;
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

	const redirectUri = getRedirectUrl(oauthConfig.redirectSignIn);
	
	store.storeOAuthInFlight(true);
	store.storeOAuthState(state);
	store.storePKCE(value);

	const queryString = Object.entries({
		redirect_uri: redirectUri ,
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
	const { type, error, url } =
		(await openAuthSession(oAuthUrl, redirectSignIn, preferPrivateSession)) ??
		{};
	// This code will run in RN applications only as calling signInWithRedirect will
	// resolve the promise.
	if (type === 'success' && url) {
		// ensure the code exchange completion resolves the signInWithRedirect
		// returned promise in react-native
		await handleAuthResponse({
			currentUrl: url,
			clientId,
			domain,
			redirectUri: redirectSignIn[0],
			responseType,
			userAgentValue: getAuthUserAgentValue(AuthAction.SignInWithRedirect),
			preferPrivateSession,
		});
	}
	// This code will run in RN applications only as calling signInWithRedirect will
	// resolve the promise.
	if (type === 'error') {
		await handleFailure(String(error));
	}
}

async function handleCodeFlow({
	currentUrl,
	userAgentValue,
	clientId,
	redirectUri,
	domain,
	preferPrivateSession,
}: {
	currentUrl: string;
	userAgentValue: string;
	clientId: string;
	redirectUri: string;
	domain: string;
	preferPrivateSession?: boolean;
}) {
	/* Convert URL into an object with parameters as keys
{ redirect_uri: 'http://localhost:3000/', response_type: 'code', ...} */
	const url = new AmplifyUrl(currentUrl);
	let validatedState: string;
	try {
		validatedState = await validateState(getStateFromURL(url));
	} catch (err) {
		invokeAndClearPromise();
		// validateState method will always throw an AuthError when the state is not valid. The if statement is making TS happy.
		if (err instanceof AuthError) {
			await handleFailure(err.message);
		}
		return;
	}
	const code = url.searchParams.get('code');

	if (!code) {
		await store.clearOAuthData();
		invokeAndClearPromise();
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
		error_message,
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
		await handleFailure(error_message ?? error);
	}

	await store.clearOAuthInflightData();

	const username =
		(access_token && decodeJWT(access_token).payload.username) ?? 'username';

	await cacheCognitoTokens({
		username,
		AccessToken: access_token,
		IdToken: id_token,
		RefreshToken: refresh_token,
		TokenType: token_type,
		ExpiresIn: expires_in,
	});

	return completeFlow({
		redirectUri,
		state: validatedState,
		preferPrivateSession,
	});
}

async function handleImplicitFlow({
	currentUrl,
	redirectUri,
	preferPrivateSession,
}: {
	currentUrl: string;
	redirectUri: string;
	preferPrivateSession?: boolean;
}) {
	// hash is `null` if `#` doesn't exist on URL

	const url = new AmplifyUrl(currentUrl);

	const {
		id_token,
		access_token,
		state,
		token_type,
		expires_in,
		error_description,
		error,
	} = (url.hash ?? '#')
		.substring(1) // Remove # from returned code
		.split('&')
		.map(pairings => pairings.split('='))
		.reduce((accum, [k, v]) => ({ ...accum, [k]: v }), {
			id_token: undefined,
			access_token: undefined,
			state: undefined,
			token_type: undefined,
			expires_in: undefined,
			error_description: undefined,
			error: undefined,
		});

	if (error) {
		invokeAndClearPromise();
		await handleFailure(error_description ?? error);
	}

	if (!access_token) {
		await store.clearOAuthData();
		invokeAndClearPromise();
		return;
	}
	let validatedState;
	try {
		validatedState = await validateState(state);
	} catch (error) {
		invokeAndClearPromise();
		// validateState method will always throw an AuthError when the state is not valid. The if statement is making TS happy.
		if (error instanceof AuthError) {
			await handleFailure(error.message);
		}
		return;
	}

	const username =
		(access_token && decodeJWT(access_token).payload.username) ?? 'username';

	await cacheCognitoTokens({
		username,
		AccessToken: access_token,
		IdToken: id_token,
		TokenType: token_type,
		ExpiresIn: expires_in,
	});

	return completeFlow({
		redirectUri,
		state: validatedState,
		preferPrivateSession,
	});
}

async function completeFlow({
	redirectUri,
	state,
	preferPrivateSession,
}: {
	preferPrivateSession?: boolean;
	redirectUri: string;
	state: string;
}) {
	await store.clearOAuthData();
	await store.storeOAuthSignIn(true, preferPrivateSession);
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
	preferPrivateSession,
}: {
	currentUrl: string;
	userAgentValue: string;
	clientId: string;
	redirectUri: string;
	responseType: string;
	domain: string;
	preferPrivateSession?: boolean;
}) {
	try {
		const urlParams = new AmplifyUrl(currentUrl);
		const error = urlParams.searchParams.get('error');
		const errorMessage = urlParams.searchParams.get('error_description');

		if (error) {
			await handleFailure(errorMessage);
		}

		if (responseType === 'code') {
			return await handleCodeFlow({
				currentUrl,
				userAgentValue,
				clientId,
				redirectUri,
				domain,
				preferPrivateSession,
			});
		} else {
			return await handleImplicitFlow({
				currentUrl,
				redirectUri,
				preferPrivateSession,
			});
		}
	} catch (e) {
		throw e;
	}
}

function getStateFromURL(urlParams: URL): string | null {
	return urlParams.searchParams.get('state');
}

async function validateState(state?: string | null): Promise<string> {
	const savedState = await store.loadOAuthState();

	// This is because savedState only exists if the flow was initiated by Amplify
	const validatedState = state === savedState ? savedState : undefined;
	if (!validatedState) {
		throw new AuthError({
			name: AuthErrorTypes.OAuthSignInError,
			message: 'An error occurred while validating the state',
			recoverySuggestion: 'Try to initiate an OAuth flow from Amplify',
		});
	}
	return validatedState;
}

async function handleFailure(errorMessage: string | null) {
	const error = new AuthError({
		message: errorMessage ?? 'An error has occurred during the oauth proccess',
		name: AuthErrorCodes.OAuthSignInError,
		recoverySuggestion: authErrorMessages.oauthSignInError.log,
	});
	await store.clearOAuthInflightData();
	Hub.dispatch(
		'auth',
		{ event: 'signInWithRedirect_failure', data: { error } },
		'Auth',
		AMPLIFY_SYMBOL
	);
	throw new AuthError({
		message: errorMessage ?? '',
		name: AuthErrorCodes.OAuthSignInError,
		recoverySuggestion: authErrorMessages.oauthSignInError.log,
	});
}

export async function parseRedirectURL() {
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

		await handleAuthResponse({
			currentUrl,
			clientId: userPoolClientId,
			domain,
			redirectUri: redirectSignIn[0],
			responseType,
			userAgentValue: getAuthUserAgentValue(AuthAction.SignInWithRedirect),
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
let inflightPromiseResolvers: ((value: void | PromiseLike<void>) => void)[] =
	[];

const invokeAndClearPromise = () => {
	for (const promiseResolver of inflightPromiseResolvers) {
		promiseResolver();
	}
	inflightPromiseResolvers = [];
};

isBrowser() &&
	cognitoUserPoolsTokenProvider.setWaitForInflightOAuth(
		() =>
			new Promise(async (res, _rej) => {
				if (!(await store.loadOAuthInFlight())) {
					res();
				} else {
					inflightPromiseResolvers.push(res);
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
