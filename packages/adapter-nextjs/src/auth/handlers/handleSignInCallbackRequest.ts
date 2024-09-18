// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PKCE_COOKIE_NAME, STATE_COOKIE_NAME } from '../constant';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesRemoveOptions,
	createOnSignInCompletedRedirectIntermediate,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromRequest,
	resolveCodeAndStateFromUrl,
	resolveRedirectSignInUrl,
} from '../utils';

import { HandleSignInCallbackRequest } from './types';

export const handleSignInCallbackRequest: HandleSignInCallbackRequest = async ({
	request,
	handlerInput,
	userPoolClientId,
	oAuthConfig,
	setCookieOptions,
	origin,
}) => {
	const { code, state } = resolveCodeAndStateFromUrl(request.url);
	if (!code || !state) {
		return new Response(null, { status: 400 });
	}

	const { [PKCE_COOKIE_NAME]: clientPkce, [STATE_COOKIE_NAME]: clientState } =
		getCookieValuesFromRequest(request, [PKCE_COOKIE_NAME, STATE_COOKIE_NAME]);
	if (!clientState || clientState !== state || !clientPkce) {
		return new Response(null, { status: 400 });
	}

	const tokensPayload = await exchangeAuthNTokens({
		redirectUri: resolveRedirectSignInUrl(origin, oAuthConfig),
		userPoolClientId,
		oAuthConfig,
		code,
		codeVerifier: clientPkce,
	});

	if ('error' in tokensPayload) {
		return new Response(tokensPayload.error, { status: 500 });
	}

	const headers = new Headers();
	appendSetCookieHeaders(
		headers,
		createTokenCookies({
			tokensPayload,
			userPoolClientId,
		}),
		createTokenCookiesSetOptions(setCookieOptions),
	);
	appendSetCookieHeaders(
		headers,
		createSignInFlowProofCookies({ state: '', pkce: '' }),
		createAuthFlowProofCookiesRemoveOptions(setCookieOptions),
	);

	// When Cognito redirects back to `/sign-in-callback`, the referer is Cognito
	// endpoint. If redirect end user to `redirectOnSignInComplete` from this point,
	// the referer remains the same.
	// When authN token cookies set as `sameSite: 'strict'`, this may cause the
	// authN tokens cookies set with the redirect response not to be sent to the
	// server. Hence, sending a html page with status 200 to the client, and perform
	// the redirection on the client side.
	headers.set('Content-Type', 'text/html');

	return new Response(
		createOnSignInCompletedRedirectIntermediate({
			redirectOnSignInComplete: handlerInput.redirectOnSignInComplete ?? '/',
		}),
		{
			status: 200,
			headers,
		},
	);
};
