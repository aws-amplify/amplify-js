/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';
import { CookieStorage } from 'aws-amplify/adapter-core';
import { NextApiRequest } from 'next';

import { handleSignInCallbackRequestForPagesRouter } from '../../../src/auth/handlers/handleSignInCallbackRequestForPagesRouter';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesRemoveOptions,
	createOnSignInCompletedRedirectIntermediate,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromNextApiRequest,
	resolveCodeAndStateFromUrl,
	resolveRedirectSignInUrl,
} from '../../../src/auth/utils';
import { CreateAuthRoutesHandlersInput } from '../../../src/auth/types';
import {
	PKCE_COOKIE_NAME,
	STATE_COOKIE_NAME,
} from '../../../src/auth/constant';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeadersToNextApiResponse = jest.mocked(
	appendSetCookieHeadersToNextApiResponse,
);
const mockCreateAuthFlowProofCookiesRemoveOptions = jest.mocked(
	createAuthFlowProofCookiesRemoveOptions,
);
const mockCreateOnSignInCompletedRedirectIntermediate = jest.mocked(
	createOnSignInCompletedRedirectIntermediate,
);
const mockCreateSignInFlowProofCookies = jest.mocked(
	createSignInFlowProofCookies,
);
const mockCreateTokenCookies = jest.mocked(createTokenCookies);
const mockCreateTokenCookiesSetOptions = jest.mocked(
	createTokenCookiesSetOptions,
);
const mockExchangeAuthNTokens = jest.mocked(exchangeAuthNTokens);
const mockGetCookieValuesFromNextApiRequest = jest.mocked(
	getCookieValuesFromNextApiRequest,
);
const mockResolveCodeAndStateFromUrl = jest.mocked(resolveCodeAndStateFromUrl);
const mockResolveRedirectSignInUrl = jest.mocked(resolveRedirectSignInUrl);

describe('handleSignInCallbackRequest', () => {
	const mockHandlerInput: CreateAuthRoutesHandlersInput = {
		redirectOnSignInComplete: '/home',
		redirectOnSignOutComplete: '/sign-in',
	};
	const mockUserPoolClientId = 'userPoolClientId';
	const mockOAuthConfig = {} as OAuthConfig;
	const mockSetCookieOptions = {} as CookieStorage.SetCookieOptions;
	const mockOrigin = 'https://example.com';
	const {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponse,
	} = createMockNextApiResponse();

	afterEach(() => {
		mockAppendSetCookieHeadersToNextApiResponse.mockClear();
		mockCreateAuthFlowProofCookiesRemoveOptions.mockClear();
		mockCreateOnSignInCompletedRedirectIntermediate.mockClear();
		mockCreateSignInFlowProofCookies.mockClear();
		mockCreateTokenCookies.mockClear();
		mockCreateTokenCookiesSetOptions.mockClear();
		mockExchangeAuthNTokens.mockClear();
		mockGetCookieValuesFromNextApiRequest.mockClear();
		mockResolveCodeAndStateFromUrl.mockClear();
		mockResolveRedirectSignInUrl.mockClear();

		mockResponseAppendHeader.mockClear();
		mockResponseEnd.mockClear();
		mockResponseStatus.mockClear();
		mockResponseSend.mockClear();
	});

	test.each([
		[null, 'state'],
		['state', null],
	])(
		'returns a 400 response when request.url contains query params: code=%s, state=%s',
		async (code, state) => {
			mockResolveCodeAndStateFromUrl.mockReturnValueOnce({
				code,
				state,
			});
			const url = '/api/auth/sign-in-callback';
			const mockRequest = {
				query: { code, state },
				url: '/api/auth/sign-in-callback',
			} as unknown as NextApiRequest;

			await handleSignInCallbackRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				handlerInput: mockHandlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			expect(mockResponseStatus).toHaveBeenCalledWith(400);
			expect(mockResponseEnd).toHaveBeenCalled();
			expect(mockResolveCodeAndStateFromUrl).toHaveBeenCalledWith(url);
		},
	);

	test.each([
		['client state cookie is missing', undefined, 'state', 'pkce'],
		[
			'client cookie state a different value from the state query parameter',
			'state_different',
			'state',
			'pkce',
		],
		['client pkce cookie is missing', 'state', 'state', undefined],
	])(
		`returns a 400 response when %s`,
		async (_, clientState, state, clientPkce) => {
			mockResolveCodeAndStateFromUrl.mockReturnValueOnce({
				code: 'not_important_for_this_test',
				state,
			});
			mockGetCookieValuesFromNextApiRequest.mockReturnValueOnce({
				[STATE_COOKIE_NAME]: clientState,
				[PKCE_COOKIE_NAME]: clientPkce,
			});

			const url = `/api/auth/sign-in-callback?state=${state}&code=not_important_for_this_test`;
			const mockRequest = {
				query: { state },
				url,
			} as unknown as NextApiRequest;

			await handleSignInCallbackRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				handlerInput: mockHandlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			expect(mockResponseStatus).toHaveBeenCalledWith(400);
			expect(mockResponseEnd).toHaveBeenCalled();
			expect(mockResolveCodeAndStateFromUrl).toHaveBeenCalledWith(url);
			expect(mockGetCookieValuesFromNextApiRequest).toHaveBeenCalledWith(
				mockRequest,
				[PKCE_COOKIE_NAME, STATE_COOKIE_NAME],
			);
		},
	);

	it('returns a 500 response when exchangeAuthNTokens returns an error', async () => {
		const mockCode = 'code';
		const mockPkce = 'pkce';
		const mockSignInCallbackUrl =
			'https://example.com/api/auth/sign-in-callback';
		const mockError = 'invalid_grant';
		const mockRequest = {
			query: {},
			url: '/api/auth/sign-in-callback',
		} as unknown as NextApiRequest;
		mockResolveCodeAndStateFromUrl.mockReturnValueOnce({
			code: mockCode,
			state: 'not_important_for_this_test',
		});
		mockGetCookieValuesFromNextApiRequest.mockReturnValueOnce({
			[STATE_COOKIE_NAME]: 'not_important_for_this_test',
			[PKCE_COOKIE_NAME]: mockPkce,
		});
		mockResolveRedirectSignInUrl.mockReturnValueOnce(mockSignInCallbackUrl);
		mockExchangeAuthNTokens.mockResolvedValueOnce({
			error: mockError,
		});

		await handleSignInCallbackRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: mockOrigin,
		});

		expect(mockResponseStatus).toHaveBeenCalledWith(500);
		expect(mockResponseSend).toHaveBeenCalledWith(mockError);

		expect(mockExchangeAuthNTokens).toHaveBeenCalledWith({
			redirectUri: mockSignInCallbackUrl,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			code: mockCode,
			codeVerifier: mockPkce,
		});
	});

	test.each([
		[
			mockHandlerInput,
			mockHandlerInput.redirectOnSignInComplete!,
			`<html>redirect to ${mockHandlerInput.redirectOnSignInComplete}</html>`,
		],
		[
			{ ...mockHandlerInput, redirectOnSignInComplete: undefined },
			'/',
			`<html>redirect to /</html>`,
		],
	] as [CreateAuthRoutesHandlersInput, string, string][])(
		'returns a 200 response with expected redirect target: with handlerInput=%p, expectedFinalRedirect=%s, generates expected html=%s',
		async (handlerInput, expectedFinalRedirect, expectedHtml) => {
			const mockCode = 'code';
			const mockPkce = 'pkce';
			const mockSignInCallbackUrl =
				'https://example.com/api/auth/sign-in-callback';
			const mockRequest = {
				query: {},
				url: '/api/auth/sign-in-callback',
			} as unknown as NextApiRequest;
			const mockExchangeTokenPayload = {
				access_token: 'access_token',
				id_token: 'id_token',
				refresh_token: 'refresh_token',
				token_type: 'Bearer',
				expires_in: 3600,
			};
			const mockCreateTokenCookiesResult = [
				{ name: 'mock-cookie-1', value: 'value-1' },
			];
			mockCreateTokenCookies.mockReturnValueOnce(mockCreateTokenCookiesResult);
			const mockCreateTokenCookiesSetOptionsResult = {
				domain: 'example.com',
				path: '/',
				secure: true,
				httpOnly: true,
				sameSite: 'strict' as const,
				expires: new Date('2024-9-17'),
			};
			mockCreateTokenCookiesSetOptions.mockReturnValueOnce(
				mockCreateTokenCookiesSetOptionsResult,
			);
			const mockCreateSignInFlowProofCookiesResult = [
				{ name: 'mock-cookie-2', value: 'value-2' },
			];
			mockCreateSignInFlowProofCookies.mockReturnValueOnce(
				mockCreateSignInFlowProofCookiesResult,
			);
			const mockCreateAuthFlowProofCookiesRemoveOptionsResult = {
				domain: 'example.com',
				path: '/',
				expires: new Date('1970-1-1'),
			};
			mockCreateAuthFlowProofCookiesRemoveOptions.mockReturnValueOnce(
				mockCreateAuthFlowProofCookiesRemoveOptionsResult,
			);
			mockResolveCodeAndStateFromUrl.mockReturnValueOnce({
				code: mockCode,
				state: 'not_important_for_this_test',
			});
			mockGetCookieValuesFromNextApiRequest.mockReturnValueOnce({
				[STATE_COOKIE_NAME]: 'not_important_for_this_test',
				[PKCE_COOKIE_NAME]: mockPkce,
			});
			mockResolveRedirectSignInUrl.mockReturnValueOnce(mockSignInCallbackUrl);
			mockExchangeAuthNTokens.mockResolvedValueOnce(mockExchangeTokenPayload);
			mockAppendSetCookieHeadersToNextApiResponse.mockImplementationOnce(
				response => {
					response.appendHeader('Set-cookie', 'mock-cookie-1');
					response.appendHeader('Set-cookie', 'mock-cookie-2');
				},
			);
			mockCreateOnSignInCompletedRedirectIntermediate.mockImplementationOnce(
				({ redirectOnSignInComplete }) =>
					`<html>redirect to ${redirectOnSignInComplete}</html>`,
			);

			await handleSignInCallbackRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				handlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			// verify the response
			expect(mockResponseAppendHeader).toHaveBeenCalledTimes(3);
			expect(mockResponseAppendHeader).toHaveBeenNthCalledWith(
				1,
				'Set-cookie',
				'mock-cookie-1',
			);
			expect(mockResponseAppendHeader).toHaveBeenNthCalledWith(
				2,
				'Set-cookie',
				'mock-cookie-2',
			);
			expect(mockResponseAppendHeader).toHaveBeenNthCalledWith(
				3,
				'Content-Type',
				'text/html',
			);
			expect(mockResponseSend).toHaveBeenCalledWith(expectedHtml);

			// verify calls to the dependencies
			expect(mockCreateTokenCookies).toHaveBeenCalledWith({
				tokensPayload: mockExchangeTokenPayload,
				userPoolClientId: mockUserPoolClientId,
			});
			expect(mockCreateTokenCookiesSetOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
			);
			expect(mockCreateSignInFlowProofCookies).toHaveBeenCalledWith({
				state: '',
				pkce: '',
			});
			expect(mockCreateAuthFlowProofCookiesRemoveOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
			);

			expect(
				mockCreateOnSignInCompletedRedirectIntermediate,
			).toHaveBeenCalledWith({
				redirectOnSignInComplete: expectedFinalRedirect,
			});
		},
	);
});
