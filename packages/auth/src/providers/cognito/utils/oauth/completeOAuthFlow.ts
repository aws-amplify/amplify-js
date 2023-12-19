// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_SYMBOL,
	AmplifyUrl,
	USER_AGENT_HEADER,
	urlSafeDecode,
} from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../../errors/AuthError';
import { oAuthStore } from './oAuthStore';
import { Hub, decodeJWT } from '@aws-amplify/core';
import { validateState } from './validateState';
import { handleFailure } from './handleFailure';
import { resolveAndClearInflightPromises } from './inflightPromise';
import { cacheCognitoTokens } from '../../tokenProvider/cacheTokens';
import { getCurrentUser } from '../../apis/getCurrentUser';

export const completeOAuthFlow = async ({
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
}): Promise<void> => {
	const urlParams = new AmplifyUrl(currentUrl);
	const error = urlParams.searchParams.get('error');
	const errorMessage = urlParams.searchParams.get('error_description');

	if (error) {
		resolveAndClearInflightPromises();
		return handleFailure(errorMessage);
	}

	if (responseType === 'code') {
		return handleCodeFlow({
			currentUrl,
			userAgentValue,
			clientId,
			redirectUri,
			domain,
			preferPrivateSession,
		});
	}

	return handleImplicitFlow({
		currentUrl,
		redirectUri,
		preferPrivateSession,
	});
};

const handleCodeFlow = async ({
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
}) => {
	/* Convert URL into an object with parameters as keys
{ redirect_uri: 'http://localhost:3000/', response_type: 'code', ...} */
	const url = new AmplifyUrl(currentUrl);
	let validatedState: string;
	try {
		validatedState = await validateState(url.searchParams.get('state'));
	} catch (err) {
		resolveAndClearInflightPromises();
		// validateState method will always throw an AuthError when the state is not valid. The if statement is making TS happy.
		if (err instanceof AuthError) {
			await handleFailure(err.message);
		}
		return;
	}
	const code = url.searchParams.get('code');

	if (!code) {
		await oAuthStore.clearOAuthData();
		resolveAndClearInflightPromises();
		return;
	}

	const oAuthTokenEndpoint = 'https://' + domain + '/oauth2/token';

	// TODO(v6): check hub events
	// dispatchAuthEvent(
	// 	'codeFlow',
	// 	{},
	// 	`Retrieving tokens from ${oAuthTokenEndpoint}`
	// );

	const codeVerifier = await oAuthStore.loadPKCE();

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
		resolveAndClearInflightPromises();
		await handleFailure(error_message ?? error);
	}

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
};

const handleImplicitFlow = async ({
	currentUrl,
	redirectUri,
	preferPrivateSession,
}: {
	currentUrl: string;
	redirectUri: string;
	preferPrivateSession?: boolean;
}) => {
	// hash is `null` if `#` doesn't exist on URL

	const url = new AmplifyUrl(currentUrl);

	const {
		id_token,
		access_token,
		state,
		token_type,
		expires_in,
		// the following have been handled at line 40
		// error_description,
		// error,
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

	if (!access_token) {
		await oAuthStore.clearOAuthData();
		resolveAndClearInflightPromises();
		return;
	}
	let validatedState;
	try {
		validatedState = await validateState(state);
	} catch (error) {
		resolveAndClearInflightPromises();
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
};

const completeFlow = async ({
	redirectUri,
	state,
	preferPrivateSession,
}: {
	preferPrivateSession?: boolean;
	redirectUri: string;
	state: string;
}) => {
	await oAuthStore.clearOAuthData();
	await oAuthStore.storeOAuthSignIn(true, preferPrivateSession);
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
	resolveAndClearInflightPromises();
};

const isCustomState = (state: string): Boolean => {
	return /-/.test(state);
};

const getCustomState = (state: string): string => {
	return state.split('-').splice(1).join('-');
};

const clearHistory = (redirectUri: string) => {
	if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
		window.history.replaceState({}, '', redirectUri);
	}
};
