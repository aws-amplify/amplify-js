// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AUTH_KEY_PREFIX,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import { IS_SIGNING_OUT_COOKIE_NAME } from '../constant';
import {
	appendSetCookieHeaders,
	createTokenCookiesRemoveOptions,
	createTokenRemoveCookies,
	getCookieValuesFromRequest,
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
	}) => {
		const { [IS_SIGNING_OUT_COOKIE_NAME]: isSigningOut } =
			getCookieValuesFromRequest(request, [IS_SIGNING_OUT_COOKIE_NAME]);
		if (!isSigningOut) {
			return new Response(null, { status: 400 });
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
					Location: handlerInput.redirectOnSignOutComplete ?? '/',
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
					Location: handlerInput.redirectOnSignOutComplete ?? '/',
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
					...Object.values(authCookiesKeys),
					lastAuthUserCookieName,
					IS_SIGNING_OUT_COOKIE_NAME,
				]),
			],
			createTokenCookiesRemoveOptions(setCookieOptions),
		);

		headers.set('Location', handlerInput.redirectOnSignOutComplete ?? '/');

		return new Response(null, {
			status: 302,
			headers,
		});
	};
