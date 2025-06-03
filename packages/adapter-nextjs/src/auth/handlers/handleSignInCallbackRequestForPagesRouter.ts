// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PKCE_COOKIE_NAME,
	SIGN_IN_TIMEOUT_ERROR_CODE,
	SIGN_IN_TIMEOUT_ERROR_MESSAGE,
	STATE_COOKIE_NAME,
} from '../constant';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesRemoveOptions,
	createErrorSearchParamsString,
	createRedirectionIntermediary,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromNextApiRequest,
	getRedirectOrDefault,
	parseSignInCallbackUrl,
	resolveRedirectSignInUrl,
} from '../utils';

import { HandleSignInCallbackRequestForPagesRouter } from './types';

export const handleSignInCallbackRequestForPagesRouter: HandleSignInCallbackRequestForPagesRouter =
	async ({
		request,
		response,
		handlerInput,
		userPoolClientId,
		oAuthConfig,
		setCookieOptions,
		origin,
	}) => {
		const { code, state, error, errorDescription } = parseSignInCallbackUrl(
			request.url!,
		);

		if (errorDescription || error) {
			const searchParamsString = createErrorSearchParamsString({
				error,
				errorDescription,
			});
			response.redirect(
				302,
				`${getRedirectOrDefault(handlerInput.redirectOnSignOutComplete)}?${searchParamsString}`,
			);

			return;
		}

		if (!code || !state) {
			response.status(400).end();

			return;
		}

		const { [PKCE_COOKIE_NAME]: clientPkce, [STATE_COOKIE_NAME]: clientState } =
			getCookieValuesFromNextApiRequest(request, [
				PKCE_COOKIE_NAME,
				STATE_COOKIE_NAME,
			]);

		// The state and pkce cookies are removed from cookie store after 5 minutes
		if (!clientState || !clientPkce) {
			const searchParamsString = createErrorSearchParamsString({
				error: SIGN_IN_TIMEOUT_ERROR_CODE,
				errorDescription: SIGN_IN_TIMEOUT_ERROR_MESSAGE,
			});
			response.redirect(
				302,
				`${getRedirectOrDefault(handlerInput.redirectOnSignOutComplete)}?${searchParamsString}`,
			);

			return;
		}

		// Most likely the cookie has been tampered
		if (clientState !== state) {
			response.status(400).end();

			return;
		}

		const tokensPayload = await exchangeAuthNTokens({
			redirectUri: resolveRedirectSignInUrl(origin, oAuthConfig),
			userPoolClientId,
			oAuthConfig,
			code,
			codeVerifier: clientPkce,
		});

		if ('error' in tokensPayload) {
			response.status(500).send(tokensPayload.error);

			return;
		}

		appendSetCookieHeadersToNextApiResponse(
			response,
			createTokenCookies({
				tokensPayload,
				userPoolClientId,
			}),
			createTokenCookiesSetOptions(setCookieOptions, origin),
		);
		appendSetCookieHeadersToNextApiResponse(
			response,
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
		response
			.appendHeader('Content-Type', 'text/html')
			.status(200)
			.send(
				createRedirectionIntermediary({
					redirectTo: getRedirectOrDefault(
						handlerInput.redirectOnSignInComplete,
					),
				}),
			);
	};
