// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PKCE_COOKIE_NAME, STATE_COOKIE_NAME } from '../constant';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesRemoveOptions,
	createOnSignInCompletedRedirectIntermediate,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromNextApiRequest,
	resolveCodeAndStateFromUrl,
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
		const { code, state } = resolveCodeAndStateFromUrl(request.url!);
		if (!code || !state) {
			response.status(400).end();

			return;
		}

		const { [PKCE_COOKIE_NAME]: clientPkce, [STATE_COOKIE_NAME]: clientState } =
			getCookieValuesFromNextApiRequest(request, [
				PKCE_COOKIE_NAME,
				STATE_COOKIE_NAME,
			]);

		if (!clientState || clientState !== state || !clientPkce) {
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
			createTokenCookiesSetOptions(setCookieOptions),
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
				createOnSignInCompletedRedirectIntermediate({
					redirectOnSignInComplete:
						handlerInput.redirectOnSignInComplete ?? '/',
				}),
			);
	};
