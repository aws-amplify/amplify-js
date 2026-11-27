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

		const url = new URL(request.url!);
		const redirectToParam = url.searchParams.get('redirectTo');

		const safeRedirectTo =
			redirectToParam && redirectToParam.startsWith('/')
				? redirectToParam
				: null;

		const finalRedirect =
			safeRedirectTo ??
			getRedirectOrDefault(handlerInput.redirectOnSignInComplete);

		response
			.appendHeader('Content-Type', 'text/html')
			.status(200)
			.send(
				createRedirectionIntermediary({
					redirectTo: finalRedirect,
				}),
			);
	};
