// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AUTH_KEY_PREFIX,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import {
	IS_SIGNING_OUT_COOKIE_NAME,
	IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
} from '../constant';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesRemoveOptions,
	createRedirectionIntermediary,
	createTokenCookiesRemoveOptions,
	createTokenRemoveCookies,
	getCookieValuesFromNextApiRequest,
	getRedirectOrDefault,
	resolveRedirectSignOutUrl,
	revokeAuthNTokens,
} from '../utils';

import { HandleSignOutCallbackRequestForPagesRouter } from './types';

export const handleSignOutCallbackRequestForPagesRouter: HandleSignOutCallbackRequestForPagesRouter =
	async ({
		request,
		response,
		handlerInput,
		userPoolClientId,
		oAuthConfig,
		setCookieOptions,
		origin,
	}) => {
		const {
			[IS_SIGNING_OUT_COOKIE_NAME]: isSigningOut,
			[IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME]: isSigningOutRedirecting,
		} = getCookieValuesFromNextApiRequest(request, [
			IS_SIGNING_OUT_COOKIE_NAME,
			IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
		]);

		if (!isSigningOut) {
			response.status(400).end();

			return;
		}

		// When Cognito /logout endpoint redirects back, response has code 302, the browsers (Safari and Firefox)
		// assume the incoming request is a cross-site request and block the cookies.
		// To workaround this issue, we send an intermediate page with 200 response. This page will redirect
		// to the /sign-out-callback (this handler) again, since it's the same-site request, the cookies will be
		// sent back to the server.
		if (isSigningOutRedirecting) {
			appendSetCookieHeadersToNextApiResponse(
				response,
				// remove the IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME cookie to the next request to this
				// handler can proceed.
				createTokenRemoveCookies([IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME]),
				createAuthFlowProofCookiesRemoveOptions(setCookieOptions),
			);
			response
				.appendHeader('Content-Type', 'text/html')
				.status(200)
				.send(
					createRedirectionIntermediary({
						redirectTo: resolveRedirectSignOutUrl(origin, oAuthConfig),
					}),
				);

			return;
		}

		const lastAuthUserCookieName = `${AUTH_KEY_PREFIX}.${userPoolClientId}.LastAuthUser`;
		const { [lastAuthUserCookieName]: username } =
			getCookieValuesFromNextApiRequest(request, [lastAuthUserCookieName]);

		if (!username) {
			response.redirect(
				302,
				getRedirectOrDefault(handlerInput.redirectOnSignOutComplete),
			);

			return;
		}

		const authCookiesKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			`${userPoolClientId}.${username}`,
		);

		const { [authCookiesKeys.refreshToken]: refreshToken } =
			getCookieValuesFromNextApiRequest(request, [
				authCookiesKeys.refreshToken,
			]);

		if (!refreshToken) {
			response.redirect(
				302,
				getRedirectOrDefault(handlerInput.redirectOnSignOutComplete),
			);

			return;
		}

		const result = await revokeAuthNTokens({
			refreshToken,
			userPoolClientId,
			endpointDomain: oAuthConfig.domain,
		});

		if (result.error) {
			response.status(500).send(result.error);

			return;
		}

		appendSetCookieHeadersToNextApiResponse(
			response,
			[
				...createTokenRemoveCookies([
					authCookiesKeys.accessToken,
					authCookiesKeys.idToken,
					authCookiesKeys.refreshToken,
					lastAuthUserCookieName,
					IS_SIGNING_OUT_COOKIE_NAME,
				]),
			],
			createTokenCookiesRemoveOptions(setCookieOptions),
		);

		response.redirect(
			302,
			getRedirectOrDefault(handlerInput.redirectOnSignOutComplete),
		);
	};
