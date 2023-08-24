// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, Hub } from '@aws-amplify/core';
import {
	AuthProvider,
	SignInWithRedirectRequest,
} from '../../../types/requests';
import { Sha256 } from '@aws-crypto/sha256-js';
import { OAuthConfig } from '@aws-amplify/core';
import { Buffer } from 'buffer';
import {
	assertOAuthConfig,
	urlSafeEncode,
	USER_AGENT_HEADER,
} from '@aws-amplify/core/internals/utils';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { CognitoUserPoolsTokenProvider } from '../tokenProvider';

const SELF = '_self';

/**
 * Signs a user in using a custom authentication flow without password
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException } - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 *
 * TODO: add config errors
 */
export function signInWithRedirect(
	signInWithRedirectRequest?: SignInWithRedirectRequest
): void {
	const authConfig = AmplifyV6.getConfig().Auth;
	assertOAuthConfig(authConfig);

	let provider = 'COGNITO'; // Default

	if (typeof signInWithRedirectRequest?.provider === 'string') {
		provider =
			cognitoHostedUIIdentityProviderMap[signInWithRedirectRequest.provider];
	} else if (signInWithRedirectRequest?.provider?.custom) {
		provider = signInWithRedirectRequest.provider.custom;
	}

	oauthSignIn({
		oauthConfig: authConfig.oauth,
		clientId: authConfig.userPoolWebClientId,
		provider,
		customState: signInWithRedirectRequest?.customState,
	});
}

const cognitoHostedUIIdentityProviderMap: Record<AuthProvider, string> = {
	Google: 'Google',
	Facebook: 'Facebook',
	Amazon: 'LoginWithAmazon',
	Apple: 'SignInWithApple',
};

function oauthSignIn({
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
	const generatedState = _generateState(32);

	/* encodeURIComponent is not URL safe, use urlSafeEncode instead. Cognito 
	single-encodes/decodes url on first sign in and double-encodes/decodes url
	when user already signed in. Using encodeURIComponent, Base32, Base64 add 
	characters % or = which on further encoding becomes unsafe. '=' create issue 
	for parsing query params. 
	Refer: https://github.com/aws-amplify/amplify-js/issues/5218 */
	const state = customState
		? `${generatedState}-${urlSafeEncode(customState)}`
		: generatedState;

	// TODO(v6): use default storage adapter
	window.localStorage.setItem('com.amplify.cognito.state', state);
	window.localStorage.setItem('com.amplify.cognito.inflightOAuth', 'true');
	const pkce_key = _generateRandom(128);
	window.localStorage.setItem('com.amplify.cognito.pkce', pkce_key);

	const code_challenge = _generateChallenge(pkce_key);
	const code_challenge_method = 'S256';

	const scopesString = oauthConfig.scopes.join(' ');

	const queryString = Object.entries({
		redirect_uri: oauthConfig.redirectSignIn,
		response_type: oauthConfig.responseType,
		client_id: clientId,
		identity_provider: provider,
		scope: scopesString,
		state,
		...(oauthConfig.responseType === 'code' ? { code_challenge } : {}),
		...(oauthConfig.responseType === 'code' ? { code_challenge_method } : {}),
	})
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join('&');

	const URL = `https://${oauthConfig.domain}/oauth2/authorize?${queryString}`;
	window.open(URL, SELF);
}

function _generateState(length: number) {
	let result = '';
	let i = length;
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for (; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

function _generateChallenge(code: string) {
	const awsCryptoHash = new Sha256();
	awsCryptoHash.update(code);

	const resultFromAWSCrypto = awsCryptoHash.digestSync();
	const b64 = Buffer.from(resultFromAWSCrypto).toString('base64');
	const base64URLFromAWSCrypto = _base64URL(b64);

	return base64URLFromAWSCrypto;
}

function _base64URL(string) {
	return string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function _generateRandom(size: number) {
	``;
	const CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	const buffer = new Uint8Array(size);
	if (typeof window !== 'undefined' && !!window.crypto) {
		window.crypto.getRandomValues(buffer);
	} else {
		for (let i = 0; i < size; i += 1) {
			buffer[i] = (Math.random() * CHARSET.length) | 0;
		}
	}
	return _bufferToString(buffer);
}

function _bufferToString(buffer: Uint8Array) {
	const CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const state = [];
	for (let i = 0; i < buffer.byteLength; i += 1) {
		const index = buffer[i] % CHARSET.length;
		state.push(CHARSET[index]);
	}
	return state.join('');
}

async function handleCodeFlow({
	currentUrl,
	userAgentValue,
	clientId,
	redirectUri,
	domain,
}: {
	currentUrl: string;
	userAgentValue?: string;
	clientId: string;
	redirectUri: string;
	domain: string;
}) {
	/* Convert URL into an object with parameters as keys
{ redirect_uri: 'http://localhost:3000/', response_type: 'code', ...} */
	const url = new URL(currentUrl);
	try {
		_validateStateFromURL(url);
	} catch (err) {
		resolveInflight();

		resolveInflight = () => {};
		// clear temp values
		window.localStorage.removeItem('com.amplify.cognito.pkce');
		window.localStorage.removeItem('com.amplify.cognito.state');
		window.localStorage.removeItem('com.amplify.cognito.inflightOAuth');
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

	const code_verifier = window.localStorage.getItem('com.amplify.cognito.pkce');

	const oAuthTokenBody = {
		grant_type: 'authorization_code',
		code,
		client_id: clientId,
		redirect_uri: redirectUri,
		...(code_verifier ? { code_verifier } : {}),
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
		(await fetch(oAuthTokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				[USER_AGENT_HEADER]: userAgentValue,
			},
			body,
		})) as any
	).json();

	if (error) {
		resolveInflight();

		resolveInflight = () => {};
		throw new Error(error);
	}

	// clear temp values
	// TODO(v6): use default storage adapter
	window.localStorage.removeItem('com.amplify.cognito.pkce');
	window.localStorage.removeItem('com.amplify.cognito.state');
	window.localStorage.removeItem('com.amplify.cognito.inflightOAuth');

	await cacheCognitoTokens({
		AccessToken: access_token,
		IdToken: id_token,
		RefreshToken: refresh_token,
		TokenType: token_type,
		ExpiresIn: expires_in,
	});

	// clear history

	if (window && typeof window.history !== 'undefined') {
		window.history.replaceState({}, null, redirectUri);
	}
	// this communicates Token orchestrator de flow was completed
	resolveInflight();

	resolveInflight = () => {};
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

	const { id_token, access_token, state, token_type, expires_in } = (
		url.hash || '#'
	)
		.substr(1) // Remove # from returned code
		.split('&')
		.map(pairings => pairings.split('='))
		.reduce((accum, [k, v]) => ({ ...accum, [k]: v }), {
			id_token: undefined,
			access_token: undefined,
			state: undefined,
			token_type: undefined,
			expires_in: undefined,
		});

	try {
		_validateState(state);
	} catch (error) {
		// clear temp values
		window.localStorage.removeItem('com.amplify.cognito.pkce');
		window.localStorage.removeItem('com.amplify.cognito.state');
		window.localStorage.removeItem('com.amplify.cognito.inflightOAuth');

		resolveInflight();

		resolveInflight = () => {};
		return;
	} finally {
	}

	await cacheCognitoTokens({
		AccessToken: access_token,
		IdToken: id_token,
		RefreshToken: undefined,
		TokenType: token_type,
		ExpiresIn: expires_in,
	});

	// clear history

	if (window && typeof window.history !== 'undefined') {
		window.history.replaceState({}, null, redirectUri);
	}

	resolveInflight();

	resolveInflight = () => {};
}

async function handleAuthResponse({
	currentUrl,
	userAgentValue,
	clientId,
	redirectUri,
	responseType,
	domain,
}: {
	currentUrl?: string;
	userAgentValue?: string;
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
			throw new Error(error_description);
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

function _validateStateFromURL(urlParams: URL): string {
	if (!urlParams) {
		return;
	}
	const returnedState = urlParams.searchParams.get('state');

	_validateState(returnedState);
	return returnedState;
}

function _validateState(state: string) {
	// TODO(v6): use correct storage adapter and key
	const savedState = window.localStorage.getItem('com.amplify.cognito.state');

	// This is because savedState only exists if the flow was initiated by Amplify
	if (savedState && savedState !== state) {
		throw new Error('Invalid state in OAuth flow');
	}
}

let inflightOAuth = '';

function urlListener() {
	// Listen configure to parse for this
	Hub.listen('core', capsule => {
		if (capsule.payload.event === 'configure') {
			const authConfig = AmplifyV6.getConfig().Auth;
			// TODO(v6): use correct storage adapter and key
			// TODO(v6): use this also with metadata for token provider
			inflightOAuth = window.localStorage.getItem(
				'com.amplify.cognito.inflightOAuth'
			);
			// check if there is an inflight oauth flow
			if (!inflightOAuth) {
				// not OAuth in flight
				return;
			}
			try {
				assertOAuthConfig(authConfig);
			} catch (err) {
				// TODO(v6): this should warn you have signInWithRedirect but is not configured
				return;
			}

			try {
				const url = window.location.href;

				handleAuthResponse({
					currentUrl: url,
					clientId: authConfig.userPoolWebClientId,
					domain: authConfig.oauth.domain,
					redirectUri: authConfig.oauth.redirectSignIn,
					responseType: authConfig.oauth.responseType,
				});
			} catch (err) {
				// is ok if there is not OAuthConfig
			}
		}
	});
}

urlListener();

// This has a reference for listeners that requires to be notified, TokenOrchestrator use this for load tokens
let resolveInflight = () => {};

CognitoUserPoolsTokenProvider.setWaitForInflightOAuth(
	() =>
		new Promise((res, _rej) => {
			if (!inflightOAuth) {
				res();
			} else {
				resolveInflight = res;
			}
			return;
		})
);
