// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PKCE_COOKIE_NAME,
	SIGN_IN_TIMEOUT_ERROR_CODE,
	SIGN_IN_TIMEOUT_ERROR_MESSAGE,
	STATE_COOKIE_NAME,
} from '../constant';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesRemoveOptions,
	createErrorSearchParamsString,
	createRedirectionIntermediary,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromRequest,
	getRedirectOrDefault,
	parseSignInCallbackUrl,
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
	const { code, state, error, errorDescription } = parseSignInCallbackUrl(
		request.url,
	);

	if (errorDescription || error) {
		const searchParamsString = createErrorSearchParamsString({
			error,
			errorDescription,
		});

		return new Response(null, {
			status: 302,
			headers: new Headers({
				location: `${getRedirectOrDefault(handlerInput.redirectOnSignOutComplete)}?${searchParamsString}`,
			}),
		});
	}

	if (!code || !state) {
		return new Response(null, { status: 400 });
	}

	const { [PKCE_COOKIE_NAME]: clientPkce, [STATE_COOKIE_NAME]: clientState } =
		getCookieValuesFromRequest(request, [PKCE_COOKIE_NAME, STATE_COOKIE_NAME]);

	if (!clientState || !clientPkce) {
		const searchParamsString = createErrorSearchParamsString({
			error: SIGN_IN_TIMEOUT_ERROR_CODE,
			errorDescription: SIGN_IN_TIMEOUT_ERROR_MESSAGE,
		});

		return new Response(null, {
			status: 302,
			headers: new Headers({
				location: `${getRedirectOrDefault(handlerInput.redirectOnSignOutComplete)}?${searchParamsString}`,
			}),
		});
	}

	if (clientState !== state) {
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
		createTokenCookiesSetOptions(setCookieOptions, origin),
	);
	appendSetCookieHeaders(
		headers,
		createSignInFlowProofCookies({ state: '', pkce: '' }),
		createAuthFlowProofCookiesRemoveOptions(setCookieOptions),
	);

	const url = new URL(request.url);
	const redirectToParam = url.searchParams.get('redirectTo');

	const safeRedirectTo =
		redirectToParam && redirectToParam.startsWith('/') ? redirectToParam : null;

	const finalRedirect =
		safeRedirectTo ??
		getRedirectOrDefault(handlerInput.redirectOnSignInComplete);

	headers.set('Content-Type', 'text/html');

	return new Response(
		createRedirectionIntermediary({
			redirectTo: finalRedirect,
		}),
		{
			status: 200,
			headers,
		},
	);
};
