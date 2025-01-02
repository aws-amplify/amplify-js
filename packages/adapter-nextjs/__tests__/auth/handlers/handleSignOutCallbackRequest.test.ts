/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';
import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';

import { IS_SIGNING_OUT_COOKIE_NAME } from '../../../src/auth/constant';
import { handleSignOutCallbackRequest } from '../../../src/auth/handlers/handleSignOutCallbackRequest';
import { CreateAuthRoutesHandlersInput } from '../../../src/auth/types';
import {
	appendSetCookieHeaders,
	createTokenCookiesRemoveOptions,
	createTokenRemoveCookies,
	getCookieValuesFromRequest,
	revokeAuthNTokens,
} from '../../../src/auth/utils';

jest.mock('aws-amplify/adapter-core', () => ({
	...jest.requireActual('aws-amplify/adapter-core'),
	createKeysForAuthStorage: jest.fn(),
}));
jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeaders = jest.mocked(appendSetCookieHeaders);
const mockCreateTokenCookiesRemoveOptions = jest.mocked(
	createTokenCookiesRemoveOptions,
);
const mockCreateTokenRemoveCookies = jest.mocked(createTokenRemoveCookies);
const mockGetCookieValuesFromRequest = jest.mocked(getCookieValuesFromRequest);
const mockRevokeAuthNTokens = jest.mocked(revokeAuthNTokens);
const mockCreateKeysForAuthStorage = jest.mocked(createKeysForAuthStorage);

describe('handleSignOutCallbackRequest', () => {
	const mockRequest = new Request(
		'https://example.com/api/auth/sign-out-callback',
	);
	const mockHandlerInput: CreateAuthRoutesHandlersInput = {};
	const mockUserPoolClientId = 'userPoolClientId';
	const mockOAuthConfig = { domain: 'example.com' } as unknown as OAuthConfig;
	const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
		domain: '.example.com',
	};

	afterEach(() => {
		mockAppendSetCookieHeaders.mockClear();
		mockCreateTokenCookiesRemoveOptions.mockClear();
		mockCreateTokenRemoveCookies.mockClear();
		mockGetCookieValuesFromRequest.mockClear();
		mockRevokeAuthNTokens.mockClear();
	});

	it(`returns a 400 response when the request does not have the "${IS_SIGNING_OUT_COOKIE_NAME}" cookie`, async () => {
		mockGetCookieValuesFromRequest.mockReturnValueOnce({});

		const response = await handleSignOutCallbackRequest({
			request: mockRequest,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(response.status).toBe(400);

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			IS_SIGNING_OUT_COOKIE_NAME,
		]);
	});

	it('returns a 302 response to redirect to handlerInput.redirectOnSignOutComplete when the request cookies do not have a username', async () => {
		mockGetCookieValuesFromRequest
			.mockReturnValueOnce({
				[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
			})
			.mockReturnValueOnce({});

		const response = await handleSignOutCallbackRequest({
			request: mockRequest,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('/');

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			IS_SIGNING_OUT_COOKIE_NAME,
		]);
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
		]);
	});

	it('returns a 302 response to redirect to handlerInput.redirectOnSignOutComplete when the request cookies do not have a refresh token', async () => {
		mockGetCookieValuesFromRequest
			.mockReturnValueOnce({
				[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
			})
			.mockReturnValueOnce({
				[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`]: 'a_user',
			})
			.mockReturnValueOnce({});
		mockCreateKeysForAuthStorage.mockReturnValueOnce({
			refreshToken: 'mock_refresh_token_cookie_name',
		} as any);

		const response = await handleSignOutCallbackRequest({
			request: mockRequest,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('/');

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			IS_SIGNING_OUT_COOKIE_NAME,
		]);
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
		]);
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			'mock_refresh_token_cookie_name',
		]);
	});

	it('returns a 500 response when revoke token call returns an error', async () => {
		mockGetCookieValuesFromRequest
			.mockReturnValueOnce({
				[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
			})
			.mockReturnValueOnce({
				[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`]: 'a_user',
			})
			.mockReturnValueOnce({
				mock_refresh_token_cookie_name: 'mock_refresh_token',
			});
		mockCreateKeysForAuthStorage.mockReturnValueOnce({
			refreshToken: 'mock_refresh_token_cookie_name',
		} as any);
		mockRevokeAuthNTokens.mockResolvedValueOnce({ error: 'invalid_request' });

		const response = await handleSignOutCallbackRequest({
			request: mockRequest,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(response.status).toBe(500);
		expect(await response.text()).toBe('invalid_request');

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			IS_SIGNING_OUT_COOKIE_NAME,
		]);
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
		]);
		expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
			'mock_refresh_token_cookie_name',
		]);
		expect(mockRevokeAuthNTokens).toHaveBeenCalledWith({
			refreshToken: 'mock_refresh_token',
			userPoolClientId: mockUserPoolClientId,
			endpointDomain: mockOAuthConfig.domain,
		});
	});

	test.each([
		[mockHandlerInput, '/'],
		[
			{ ...mockHandlerInput, redirectOnSignOutComplete: '/sign-in' },
			'/sign-in',
		],
	] as [CreateAuthRoutesHandlersInput, string][])(
		`returns a 302 response with expected redirect location: with handlerInput: %p, expected redirect location: %s`,
		async (handlerInput, expectedFinalRedirect) => {
			mockGetCookieValuesFromRequest
				.mockReturnValueOnce({
					[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
				})
				.mockReturnValueOnce({
					[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`]: 'a_user',
				})
				.mockReturnValueOnce({
					mock_refresh_token_cookie_name: 'mock_refresh_token',
				});
			const mockCreateKeysForAuthStorageResult = {
				refreshToken: 'mock_refresh_token_cookie_name',
			} as any;
			mockCreateKeysForAuthStorage.mockReturnValueOnce(
				mockCreateKeysForAuthStorageResult,
			);
			mockRevokeAuthNTokens.mockResolvedValueOnce({});
			const mockCreateTokenRemoveCookiesResult = [
				{
					name: 'mock_cookie1',
					value: '',
				},
				{
					name: 'mock_cookie1',
					value: '',
				},
			];
			mockCreateTokenRemoveCookies.mockReturnValueOnce(
				mockCreateTokenRemoveCookiesResult,
			);
			const mockCreateTokenCookiesRemoveOptionsResult = {
				domain: mockSetCookieOptions.domain,
				path: '/',
				expires: new Date('1970-01-01'),
			};
			mockCreateTokenCookiesRemoveOptions.mockReturnValueOnce(
				mockCreateTokenCookiesRemoveOptionsResult,
			);
			mockAppendSetCookieHeaders.mockImplementationOnce(headers => {
				headers.append(
					'Set-Cookie',
					'mock_cookie1=; Domain=.example.com; Path=/',
				);
				headers.append(
					'Set-Cookie',
					'mock_cookie2=; Domain=.example.com; Path=/',
				);
			});

			const response = await handleSignOutCallbackRequest({
				request: mockRequest,
				handlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
			});

			// verify the calls to dependencies
			expect(response.status).toBe(302);
			expect(response.headers.get('Location')).toBe(expectedFinalRedirect);
			expect(response.headers.get('Set-Cookie')).toBe(
				'mock_cookie1=; Domain=.example.com; Path=/, mock_cookie2=; Domain=.example.com; Path=/',
			);

			// verify the calls to dependencies
			expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
				IS_SIGNING_OUT_COOKIE_NAME,
			]);
			expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
				`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
			]);
			expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(mockRequest, [
				'mock_refresh_token_cookie_name',
			]);
			expect(mockRevokeAuthNTokens).toHaveBeenCalledWith({
				refreshToken: 'mock_refresh_token',
				userPoolClientId: mockUserPoolClientId,
				endpointDomain: mockOAuthConfig.domain,
			});
			expect(mockCreateTokenRemoveCookies).toHaveBeenCalledWith([
				...Object.values(mockCreateKeysForAuthStorageResult),
				`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
				IS_SIGNING_OUT_COOKIE_NAME,
			]);
			expect(mockCreateTokenCookiesRemoveOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
			);
			expect(mockAppendSetCookieHeaders).toHaveBeenCalledWith(
				expect.any(Headers),
				mockCreateTokenRemoveCookiesResult,
				mockCreateTokenCookiesRemoveOptionsResult,
			);
		},
	);
});
