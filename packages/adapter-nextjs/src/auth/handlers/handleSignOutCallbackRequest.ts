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
	appendSetCookieHeaders,
	createAuthFlowProofCookiesRemoveOptions,
	createRedirectionIntermediary,
	createTokenCookiesRemoveOptions,
	createTokenRemoveCookies,
	getCookieValuesFromRequest,
	getRedirectOrDefault,
	resolveRedirectSignOutUrl,
	revokeAuthNTokens,
} from '../utils';

import { HandleSignOutCallbackRequest } from './types';

export const handleSignOutCallbackRequest: HandleSignOutCallbackRequest =
	async ({
		request,
		handlerInput,
		userPoolClientId,
		oAuthConfig,
		setCookieOptions,
		origin,
	}) => {
		const {
			[IS_SIGNING_OUT_COOKIE_NAME]: isSigningOut,
			[IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME]: isSigningOutRedirecting,
		} = getCookieValuesFromRequest(request, [
			IS_SIGNING_OUT_COOKIE_NAME,
			IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
		]);
		if (!isSigningOut) {
			return new Response(null, { status: 400 });
		}

		// When Cognito /logout endpoint redirects back, response has code 302, the browsers (Safari and Firefox)
		// assume the incoming request is a cross-site request and block the cookies.
		// To workaround this issue, we send an intermediate page with 200 response. This page will redirect
		// to the /sign-out-callback (this handler) again, since it's the same-site request, the cookies will be
		// sent back to the server.
		if (isSigningOutRedirecting) {
			const headers = new Headers();
			headers.set('Content-Type', 'text/html');
			appendSetCookieHeaders(
				headers,
				// remove the IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME cookie to the next request to this
				// handler can proceed.
				createTokenRemoveCookies([IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME]),
				createAuthFlowProofCookiesRemoveOptions(setCookieOptions),
			);

			return new Response(
				createRedirectionIntermediary({
					redirectTo: resolveRedirectSignOutUrl(origin, oAuthConfig),
				}),
				{
					status: 200,
					headers,
				},
			);
		}

		const lastAuthUserCookieName = `${AUTH_KEY_PREFIX}.${userPoolClientId}.LastAuthUser`;
		const { [lastAuthUserCookieName]: username } = getCookieValuesFromRequest(
			request,
			[lastAuthUserCookieName],
		);
		if (!username) {
			return new Response(null, {
				status: 302,
				headers: new Headers({
					Location: getRedirectOrDefault(
						handlerInput.redirectOnSignOutComplete,
					),
				}),
			});
		}

		const authCookiesKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			`${userPoolClientId}.${username}`,
		);
		const { [authCookiesKeys.refreshToken]: refreshToken } =
			getCookieValuesFromRequest(request, [authCookiesKeys.refreshToken]);

		if (!refreshToken) {
			return new Response(null, {
				status: 302,
				headers: new Headers({
					Location: getRedirectOrDefault(
						handlerInput.redirectOnSignOutComplete,
					),
				}),
			});
		}

		const result = await revokeAuthNTokens({
			refreshToken,
			userPoolClientId,
			endpointDomain: oAuthConfig.domain,
		});

		if (result.error) {
			return new Response(result.error, { status: 500 });
		}

		const headers = new Headers();
		appendSetCookieHeaders(
			headers,
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

		headers.set(
			'Location',
			getRedirectOrDefault(handlerInput.redirectOnSignOutComplete),
		);

		return new Response(null, {
			status: 302,
			headers,
		});
	};
