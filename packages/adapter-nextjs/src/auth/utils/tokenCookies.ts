// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	DEFAULT_COOKIE_EXPIRY,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import { OAuthTokenResponsePayload } from '../types';

import { getAccessTokenUsernameAndClockDrift } from './getAccessTokenUsernameAndClockDrift';

export const createTokenCookies = ({
	tokensPayload,
	userPoolClientId,
}: {
	tokensPayload: OAuthTokenResponsePayload;
	userPoolClientId: string;
}) => {
	const { access_token, id_token, refresh_token } = tokensPayload;
	const { username, clockDrift } =
		getAccessTokenUsernameAndClockDrift(access_token);
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
			name: authCookiesKeys.clockDrift,
			value: String(clockDrift),
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
	setCookieOptions: CookieStorage.SetCookieOptions,
) => ({
	domain: setCookieOptions?.domain,
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: setCookieOptions.sameSite ?? 'strict',
	expires:
		setCookieOptions?.expires ?? new Date(Date.now() + DEFAULT_COOKIE_EXPIRY),
});

export const createTokenCookiesRemoveOptions = (
	setCookieOptions: CookieStorage.SetCookieOptions,
) => ({
	domain: setCookieOptions?.domain,
	path: '/',
	expires: new Date('1970-01-01'),
});
