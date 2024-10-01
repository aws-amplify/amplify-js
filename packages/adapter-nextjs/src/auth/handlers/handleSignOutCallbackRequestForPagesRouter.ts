// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AUTH_KEY_PREFIX,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import { IS_SIGNING_OUT_COOKIE_NAME } from '../constant';
import {
	appendSetCookieHeadersToNextApiResponse,
	createTokenCookiesRemoveOptions,
	createTokenRemoveCookies,
	getCookieValuesFromNextApiRequest,
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
	}) => {
		const { [IS_SIGNING_OUT_COOKIE_NAME]: isSigningOut } =
			getCookieValuesFromNextApiRequest(request, [IS_SIGNING_OUT_COOKIE_NAME]);

		if (!isSigningOut) {
			response.status(400).end();

			return;
		}

		const lastAuthUserCookieName = `${AUTH_KEY_PREFIX}.${userPoolClientId}.LastAuthUser`;
		const { [lastAuthUserCookieName]: username } =
			getCookieValuesFromNextApiRequest(request, [lastAuthUserCookieName]);

		if (!username) {
			response.redirect(302, handlerInput.redirectOnSignOutComplete ?? '/');

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
			response.redirect(302, handlerInput.redirectOnSignOutComplete ?? '/');

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
					...Object.values(authCookiesKeys),
					lastAuthUserCookieName,
					IS_SIGNING_OUT_COOKIE_NAME,
				]),
			],
			createTokenCookiesRemoveOptions(setCookieOptions),
		);

		response.redirect(302, handlerInput.redirectOnSignOutComplete ?? '/');
	};
