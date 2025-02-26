import { OAuthConfig } from 'aws-amplify/adapter-core/internals';
import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	createKeysForAuthStorage,
} from 'aws-amplify/adapter-core';
import { NextApiRequest } from 'next';

import {
	IS_SIGNING_OUT_COOKIE_NAME,
	IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
} from '../../../src/auth/constant';
import { handleSignOutCallbackRequestForPagesRouter } from '../../../src/auth/handlers/handleSignOutCallbackRequestForPagesRouter';
import { CreateAuthRoutesHandlersInput } from '../../../src/auth/types';
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
} from '../../../src/auth/utils';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('aws-amplify/adapter-core', () => ({
	...jest.requireActual('aws-amplify/adapter-core'),
	createKeysForAuthStorage: jest.fn(),
}));
jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeadersToNextApiResponse = jest.mocked(
	appendSetCookieHeadersToNextApiResponse,
);
const mockCreateTokenCookiesRemoveOptions = jest.mocked(
	createTokenCookiesRemoveOptions,
);
const mockCreateTokenRemoveCookies = jest.mocked(createTokenRemoveCookies);
const mockGetCookieValuesFromNextApiRequest = jest.mocked(
	getCookieValuesFromNextApiRequest,
);
const mockRevokeAuthNTokens = jest.mocked(revokeAuthNTokens);
const mockCreateKeysForAuthStorage = jest.mocked(createKeysForAuthStorage);
const mockGetRedirectOrDefault = jest.mocked(getRedirectOrDefault);
const mockCreateAuthFlowProofCookiesRemoveOptions = jest.mocked(
	createAuthFlowProofCookiesRemoveOptions,
);
const mockCreateRedirectionIntermediary = jest.mocked(
	createRedirectionIntermediary,
);
const mockResolveRedirectSignOutUrl = jest.mocked(resolveRedirectSignOutUrl);

describe('handleSignOutCallbackRequest', () => {
	const mockRequest = {
		cookies: {},
	} as unknown as NextApiRequest;
	const mockHandlerInput: CreateAuthRoutesHandlersInput = {};
	const mockUserPoolClientId = 'userPoolClientId';
	const mockOAuthConfig = { domain: 'example.com' } as unknown as OAuthConfig;
	const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
		domain: '.example.com',
	};
	const {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponseRedirect,
		mockResponse,
	} = createMockNextApiResponse();

	beforeAll(() => {
		mockGetRedirectOrDefault.mockImplementation(
			(redirect: string | undefined) => redirect || '/',
		);
	});

	afterEach(() => {
		mockAppendSetCookieHeadersToNextApiResponse.mockClear();
		mockCreateTokenCookiesRemoveOptions.mockClear();
		mockCreateTokenRemoveCookies.mockClear();
		mockGetCookieValuesFromNextApiRequest.mockClear();
		mockRevokeAuthNTokens.mockClear();
		mockGetRedirectOrDefault.mockClear();
		mockCreateAuthFlowProofCookiesRemoveOptions.mockClear();
		mockCreateRedirectionIntermediary.mockClear();
		mockResolveRedirectSignOutUrl.mockClear();

		mockResponseAppendHeader.mockClear();
		mockResponseEnd.mockClear();
		mockResponseStatus.mockClear();
		mockResponseSend.mockClear();
		mockResponseRedirect.mockClear();
	});

	it(`returns a 400 response when the request does not have the "${IS_SIGNING_OUT_COOKIE_NAME}" cookie`, async () => {
		mockGetCookieValuesFromNextApiRequest.mockReturnValueOnce({});

		await handleSignOutCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: 'https://example.com',
		});

		// verify the response
		expect(mockResponseStatus).toHaveBeenCalledWith(400);
		expect(mockResponseEnd).toHaveBeenCalled();

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[IS_SIGNING_OUT_COOKIE_NAME, IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME],
		);
	});

	it(`returns a 200 response with the intermediate redirect HTML when the request has the "${IS_SIGNING_OUT_COOKIE_NAME}" and "${IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME}" cookies`, async () => {
		mockGetCookieValuesFromNextApiRequest.mockReturnValueOnce({
			[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
			[IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME]: 'true',
		});
		const mockCreateTokenRemoveCookiesResult = [
			{
				name: IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
				value: '',
			},
		];
		mockCreateTokenRemoveCookies.mockReturnValueOnce(
			mockCreateTokenRemoveCookiesResult,
		);
		const mockCreateTokenCookiesRemoveOptionsResult = {
			path: '/',
			maxAge: -1,
			domain: mockSetCookieOptions.domain,
		};
		mockCreateAuthFlowProofCookiesRemoveOptions.mockReturnValueOnce(
			mockCreateTokenCookiesRemoveOptionsResult,
		);
		const mockResolveRedirectSignOutUrlResult =
			'https://example.com/sign-out-callback';
		mockResolveRedirectSignOutUrl.mockReturnValueOnce(
			mockResolveRedirectSignOutUrlResult,
		);
		const mockCreateOnSignInCompleteRedirectIntermediateResult =
			'<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>';
		mockCreateRedirectionIntermediary.mockReturnValueOnce(
			mockCreateOnSignInCompleteRedirectIntermediateResult,
		);
		mockAppendSetCookieHeadersToNextApiResponse.mockImplementationOnce(
			response => {
				response.appendHeader(
					'Set-Cookie',
					'mock_cookie1=; Domain=.example.com; Path=/',
				);
				response.appendHeader(
					'Set-Cookie',
					'mock_cookie2=; Domain=.example.com; Path=/',
				);
			},
		);

		await handleSignOutCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: 'https://example.com',
		});

		// verify the response
		expect(mockResponseStatus).toHaveBeenCalledWith(200);
		expect(mockResponseAppendHeader).toHaveBeenCalledWith(
			'Content-Type',
			'text/html',
		);
		expect(mockResponseSend).toHaveBeenCalledWith(
			mockCreateOnSignInCompleteRedirectIntermediateResult,
		);

		// verify the calls to dependencies
		expect(mockCreateTokenRemoveCookies).toHaveBeenCalledWith([
			IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME,
		]);
		expect(mockCreateAuthFlowProofCookiesRemoveOptions).toHaveBeenCalledWith(
			mockSetCookieOptions,
		);
		expect(mockResolveRedirectSignOutUrl).toHaveBeenCalledWith(
			'https://example.com',
			mockOAuthConfig,
		);
		expect(mockCreateRedirectionIntermediary).toHaveBeenCalledWith({
			redirectTo: mockResolveRedirectSignOutUrlResult,
		});
	});

	it('returns a 302 response to redirect to handlerInput.redirectOnSignOutComplete when the request cookies do not have a username', async () => {
		mockGetCookieValuesFromNextApiRequest
			.mockReturnValueOnce({
				[IS_SIGNING_OUT_COOKIE_NAME]: 'true',
			})
			.mockReturnValueOnce({});

		await handleSignOutCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: 'https://example.com',
		});

		// verify the response
		expect(mockResponseRedirect).toHaveBeenCalledWith(302, '/');
		expect(mockGetRedirectOrDefault).toHaveBeenCalledWith(undefined);

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[IS_SIGNING_OUT_COOKIE_NAME, IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME],
		);
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`],
		);
	});

	it('returns a 302 response to redirect to handlerInput.redirectOnSignOutComplete when the request cookies do not have a refresh token', async () => {
		mockGetCookieValuesFromNextApiRequest
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

		await handleSignOutCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: 'https://example.com',
		});

		// verify the response
		expect(mockResponseRedirect).toHaveBeenCalledWith(302, '/');

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[IS_SIGNING_OUT_COOKIE_NAME, IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME],
		);
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`],
		);
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			['mock_refresh_token_cookie_name'],
		);
	});

	it('returns a 500 response when revoke token call returns an error', async () => {
		mockGetCookieValuesFromNextApiRequest
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

		await handleSignOutCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: 'https://example.com',
		});

		// verify the response
		expect(mockResponseStatus).toHaveBeenCalledWith(500);
		expect(mockResponseSend).toHaveBeenCalledWith('invalid_request');

		// verify the calls to dependencies
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[IS_SIGNING_OUT_COOKIE_NAME, IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME],
		);
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`],
		);
		expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
			mockRequest,
			['mock_refresh_token_cookie_name'],
		);
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
			mockGetCookieValuesFromNextApiRequest
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
				accessToken: 'mock_access_token_cookie_name',
				idToken: 'mock_id_token_cookie_name',
				refreshToken: 'mock_refresh_token_cookie_name',
				deviceKey: 'shouldNotIncludeMe',
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
				maxAge: -1,
			};
			mockCreateTokenCookiesRemoveOptions.mockReturnValueOnce(
				mockCreateTokenCookiesRemoveOptionsResult,
			);
			mockAppendSetCookieHeadersToNextApiResponse.mockImplementationOnce(
				response => {
					response.appendHeader(
						'Set-Cookie',
						'mock_cookie1=; Domain=.example.com; Path=/',
					);
					response.appendHeader(
						'Set-Cookie',
						'mock_cookie2=; Domain=.example.com; Path=/',
					);
				},
			);

			await handleSignOutCallbackRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				handlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: 'https://example.com',
			});

			// verify the response
			expect(mockResponseRedirect).toHaveBeenCalledWith(
				302,
				expectedFinalRedirect,
			);
			expect(mockResponseAppendHeader).toHaveBeenCalledTimes(2);
			expect(mockResponseAppendHeader).toHaveBeenNthCalledWith(
				1,
				'Set-Cookie',
				'mock_cookie1=; Domain=.example.com; Path=/',
			);
			expect(mockResponseAppendHeader).toHaveBeenNthCalledWith(
				2,
				'Set-Cookie',
				'mock_cookie2=; Domain=.example.com; Path=/',
			);

			// verify the calls to dependencies
			expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
				mockRequest,
				[IS_SIGNING_OUT_COOKIE_NAME, IS_SIGNING_OUT_REDIRECTING_COOKIE_NAME],
			);
			expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
				mockRequest,
				[`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`],
			);
			expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
				mockRequest,
				['mock_refresh_token_cookie_name'],
			);
			expect(mockRevokeAuthNTokens).toHaveBeenCalledWith({
				refreshToken: 'mock_refresh_token',
				userPoolClientId: mockUserPoolClientId,
				endpointDomain: mockOAuthConfig.domain,
			});
			expect(mockCreateTokenRemoveCookies).toHaveBeenCalledWith([
				mockCreateKeysForAuthStorageResult.accessToken,
				mockCreateKeysForAuthStorageResult.idToken,
				mockCreateKeysForAuthStorageResult.refreshToken,
				`${AUTH_KEY_PREFIX}.${mockUserPoolClientId}.LastAuthUser`,
				IS_SIGNING_OUT_COOKIE_NAME,
			]);
			expect(mockCreateTokenCookiesRemoveOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
			);
			expect(mockAppendSetCookieHeadersToNextApiResponse).toHaveBeenCalledWith(
				mockResponse,
				mockCreateTokenRemoveCookiesResult,
				mockCreateTokenCookiesRemoveOptionsResult,
			);
			expect(mockGetRedirectOrDefault).toHaveBeenCalledWith(
				handlerInput.redirectOnSignOutComplete,
			);
		},
	);
});
