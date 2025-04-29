// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import { OAuthTokenResponsePayload } from '../types';
import {
	REMOVE_COOKIE_MAX_AGE,
	SERVER_AUTH_ALLOWED_AMPLIFY_AUTH_KEY_SUFFIX,
} from '../constant';

import { getAccessTokenUsername } from './getAccessTokenUsername';
import { isSSLOrigin } from './origin';

export const createTokenCookies = ({
	tokensPayload,
	userPoolClientId,
}: {
	tokensPayload: OAuthTokenResponsePayload;
	userPoolClientId: string;
}) => {
	const { access_token, id_token, refresh_token } = tokensPayload;
	const username = getAccessTokenUsername(access_token);
	const authCookiesKeys = createKeysForAuthStorage(
		AUTH_KEY_PREFIX,
		`${userPoolClientId}.${username}`,
	);

	return [
		{
			name: authCookiesKeys.accessToken,
			value: access_token,
		},
		{
			name: authCookiesKeys.idToken,
			value: id_token,
		},
		{
			name: authCookiesKeys.refreshToken,
			value: refresh_token,
		},
		{
			name: `${AUTH_KEY_PREFIX}.${userPoolClientId}.LastAuthUser`,
			value: username,
		},
	];
};

export const createTokenRemoveCookies = (keys: string[]) =>
	keys.map(key => ({ name: key, value: '' }));

export const createTokenCookiesSetOptions = (
	{ domain, sameSite, expires, maxAge }: CookieStorage.SetCookieOptions,
	origin: string,
) => {
	const result = {
		domain,
		path: '/',
		httpOnly: true,
		secure: isSSLOrigin(origin),
		sameSite: sameSite ?? 'strict',
		expires,
		maxAge,
	};

	// when expires and maxAge both are not specified, we set a default maxAge
	if (!result.expires && !result.maxAge) {
		result.maxAge = DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE;
	}

	return result;
};

export const createTokenCookiesRemoveOptions = (
	setCookieOptions: CookieStorage.SetCookieOptions,
) => ({
	domain: setCookieOptions?.domain,
	path: '/',
	maxAge: REMOVE_COOKIE_MAX_AGE, // Expire immediately (remove the cookie)
});

export const isServerSideAuthAllowedCookie = (cookieName: string) =>
	SERVER_AUTH_ALLOWED_AMPLIFY_AUTH_KEY_SUFFIX.some(suffix =>
		cookieName.endsWith(suffix),
	);
