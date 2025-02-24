import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE,
} from 'aws-amplify/adapter-core';

import { OAuthTokenResponsePayload } from '../../../src/auth/types';
import {
	createTokenCookies,
	createTokenCookiesRemoveOptions,
	createTokenCookiesSetOptions,
	createTokenRemoveCookies,
	getAccessTokenUsername,
	isServerSideAuthAllowedCookie,
} from '../../../src/auth/utils';

jest.mock('../../../src/auth/utils/getAccessTokenUsername');

const mockGetAccessTokenUsername = jest.mocked(getAccessTokenUsername);

describe('createTokenCookies', () => {
	const mockUserName = 'a_user';
	beforeAll(() => {
		mockGetAccessTokenUsername.mockReturnValue(mockUserName);
	});

	it('returns a set of cookies with correct names and values derived from the input', () => {
		const mockTokensPayload: OAuthTokenResponsePayload = {
			access_token: 'access_token',
			id_token: 'id_token',
			refresh_token: 'refresh_token',
			token_type: 'token_type',
			expires_in: 3600,
		};
		const mockUserPoolClientId = 'user-pool-client-id';
		const expectedCookieNamePrefix = `${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.${mockUserName}`;

		const result = createTokenCookies({
			tokensPayload: mockTokensPayload,
			userPoolClientId: mockUserPoolClientId,
		});

		expect(result).toEqual([
			{
				name: `${expectedCookieNamePrefix}.accessToken`,
				value: 'access_token',
			},
			{
				name: `${expectedCookieNamePrefix}.idToken`,
				value: 'id_token',
			},
			{
				name: `${expectedCookieNamePrefix}.refreshToken`,
				value: 'refresh_token',
			},
			{
				name: `${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
				value: mockUserName,
			},
		]);
	});
});

describe('createTokenRemoveCookies', () => {
	it('returns an array of cookies with empty values', () => {
		const result = createTokenRemoveCookies(['cookie1', 'cookie2', 'cookie3']);

		expect(result.sort()).toEqual(
			[
				{ name: 'cookie1', value: '' },
				{ name: 'cookie2', value: '' },
				{ name: 'cookie3', value: '' },
			].sort(),
		);
	});
});

describe('createTokenCookiesSetOptions', () => {
	it('returns an object with the correct cookie options', () => {
		const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
			expires: new Date('2024-09-17'),
		};

		const result = createTokenCookiesSetOptions(
			mockSetCookieOptions,
			'https://example.com',
		);

		expect(result).toEqual({
			domain: mockSetCookieOptions.domain,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			expires: mockSetCookieOptions.expires,
		});
	});

	it('returns an object with the default expiry and sameSite properties', () => {
		const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
		const result = createTokenCookiesSetOptions({}, 'https://example.com');

		expect(result).toEqual({
			domain: undefined,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE,
		});

		dateNowSpy.mockRestore();
	});

	it('returns an object with the correct cookie options with overridden secure attribute', () => {
		const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
			expires: new Date('2024-09-17'),
		};

		const result = createTokenCookiesSetOptions(
			mockSetCookieOptions,
			'http://example.com',
		);

		expect(result).toEqual({
			domain: mockSetCookieOptions.domain,
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			expires: mockSetCookieOptions.expires,
		});
	});
});

describe('createTokenCookiesRemoveOptions', () => {
	it('returns an object with the correct cookie options', () => {
		const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
			expires: new Date('2024-09-17'),
		};

		const result = createTokenCookiesRemoveOptions(mockSetCookieOptions);

		expect(result).toEqual({
			domain: mockSetCookieOptions?.domain,
			path: '/',
			maxAge: -1,
		});
	});
});

describe('isServerSideAuthAllowedCookie', () => {
	test.each([
		['CognitoIdentityServiceProvider.1234.aaaa.clockDrift', false],
		['CognitoIdentityServiceProvider.1234.aaaa.deviceKey', false],
		['CognitoIdentityServiceProvider.1234.aaaa.clientMetadata', false],
		['CognitoIdentityServiceProvider.1234.aaaa.oAuthMetadata', false],
		['CognitoIdentityServiceProvider.1234.aaaa', false],
		['CognitoIdentityServiceProvider.1234', false],
		['CognitoIdentityServiceProvider.1234.aaaa.refreshToken', true],
		['CognitoIdentityServiceProvider.1234.aaaa.accessToken', true],
		['CognitoIdentityServiceProvider.1234.aaaa.idToken', true],
		['CognitoIdentityServiceProvider.1234.aaaa.LastAuthUser', true],
	])('returns %s for %s', (cookieName, expected) => {
		expect(isServerSideAuthAllowedCookie(cookieName)).toBe(expected);
	});
});
