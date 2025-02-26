import { NextRequest } from 'next/server.js';
import { OAuthConfig } from 'aws-amplify/adapter-core/internals';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { handleSignInCallbackRequest } from '../../../src/auth/handlers/handleSignInCallbackRequest';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesRemoveOptions,
	createErrorSearchParamsString,
	createRedirectionIntermediary,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromRequest,
	getRedirectOrDefault,
	parseSignInCallbackUrl,
	resolveRedirectSignInUrl,
} from '../../../src/auth/utils';
import { CreateAuthRoutesHandlersInput } from '../../../src/auth/types';
import {
	PKCE_COOKIE_NAME,
	SIGN_IN_TIMEOUT_ERROR_CODE,
	SIGN_IN_TIMEOUT_ERROR_MESSAGE,
	STATE_COOKIE_NAME,
} from '../../../src/auth/constant';

import {
	ERROR_CLIENT_COOKIE_COMBINATIONS,
	ERROR_URL_PARAMS_COMBINATIONS,
} from './signInCallbackErrorCombinations';
import { mockCreateErrorSearchParamsStringImplementation } from './mockImplementation';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeaders = jest.mocked(appendSetCookieHeaders);
const mockCreateAuthFlowProofCookiesRemoveOptions = jest.mocked(
	createAuthFlowProofCookiesRemoveOptions,
);
const mockCreateRedirectionIntermediary = jest.mocked(
	createRedirectionIntermediary,
);
const mockCreateSignInFlowProofCookies = jest.mocked(
	createSignInFlowProofCookies,
);
const mockCreateTokenCookies = jest.mocked(createTokenCookies);
const mockCreateTokenCookiesSetOptions = jest.mocked(
	createTokenCookiesSetOptions,
);
const mockExchangeAuthNTokens = jest.mocked(exchangeAuthNTokens);
const mockGetCookieValuesFromRequest = jest.mocked(getCookieValuesFromRequest);
const mockParseSignInCallbackUrl = jest.mocked(parseSignInCallbackUrl);
const mockResolveRedirectSignInUrl = jest.mocked(resolveRedirectSignInUrl);
const mockGetRedirectOrDefault = jest.mocked(getRedirectOrDefault);
const mockCreateErrorSearchParamsString = jest.mocked(
	createErrorSearchParamsString,
);

describe('handleSignInCallbackRequest', () => {
	const mockHandlerInput: CreateAuthRoutesHandlersInput = {
		redirectOnSignInComplete: '/home',
		redirectOnSignOutComplete: '/sign-in',
	};
	const mockUserPoolClientId = 'userPoolClientId';
	const mockOAuthConfig = {} as OAuthConfig;
	const mockSetCookieOptions = {} as CookieStorage.SetCookieOptions;
	const mockOrigin = 'https://example.com';

	beforeAll(() => {
		mockGetRedirectOrDefault.mockImplementation(
			(redirect: string | undefined) => redirect || '/',
		);
		mockCreateErrorSearchParamsString.mockImplementation(
			mockCreateErrorSearchParamsStringImplementation,
		);
	});

	afterEach(() => {
		mockAppendSetCookieHeaders.mockClear();
		mockCreateAuthFlowProofCookiesRemoveOptions.mockClear();
		mockCreateRedirectionIntermediary.mockClear();
		mockCreateSignInFlowProofCookies.mockClear();
		mockCreateTokenCookies.mockClear();
		mockCreateTokenCookiesSetOptions.mockClear();
		mockExchangeAuthNTokens.mockClear();
		mockGetCookieValuesFromRequest.mockClear();
		mockParseSignInCallbackUrl.mockClear();
		mockResolveRedirectSignInUrl.mockClear();
		mockCreateErrorSearchParamsString.mockClear();
	});

	test.each(ERROR_URL_PARAMS_COMBINATIONS)(
		'returns a $expectedStatus response when request.url contains query params: code=$code, state=$state, error=$error, error_description=$errorDescription',
		async ({
			code,
			state,
			error,
			errorDescription,
			expectedStatus,
			expectedRedirect,
		}) => {
			mockParseSignInCallbackUrl.mockReturnValueOnce({
				code,
				state,
				error,
				errorDescription,
			});
			const url = 'https://example.com/api/auth/sign-in-callback';
			const request = new NextRequest(new URL(url));

			const response = await handleSignInCallbackRequest({
				request,
				handlerInput: mockHandlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			expect(response.status).toBe(expectedStatus);
			expect(mockParseSignInCallbackUrl).toHaveBeenCalledWith(url);

			if (expectedStatus === 302) {
				expect(response.headers.get('Location')).toBe(expectedRedirect);
			}

			if (error || errorDescription) {
				expect(mockCreateErrorSearchParamsString).toHaveBeenCalledWith({
					error,
					errorDescription,
				});
			}
		},
	);

	test.each(ERROR_CLIENT_COOKIE_COMBINATIONS)(
		`returns a $expectedStatus response when client cookies are: state=$state, pkce=$pkce and expected state value is 'state_b'`,
		async ({ state, pkce, expectedStatus, expectedRedirect }) => {
			mockParseSignInCallbackUrl.mockReturnValueOnce({
				code: 'not_important_for_this_test',
				state: 'not_important_for_this_test',
				error: null,
				errorDescription: null,
			});
			mockGetCookieValuesFromRequest.mockReturnValueOnce({
				[STATE_COOKIE_NAME]: state,
				[PKCE_COOKIE_NAME]: pkce,
			});

			const url = `https://example.com/api/auth/sign-in-callback?state=state_b&code=not_important_for_this_test`;
			const request = new NextRequest(new URL(url));

			const response = await handleSignInCallbackRequest({
				request,
				handlerInput: mockHandlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			expect(response.status).toBe(expectedStatus);
			expect(mockParseSignInCallbackUrl).toHaveBeenCalledWith(url);
			expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(request, [
				PKCE_COOKIE_NAME,
				STATE_COOKIE_NAME,
			]);

			if (expectedStatus === 302) {
				expect(mockGetRedirectOrDefault).toHaveBeenCalledWith(
					mockHandlerInput.redirectOnSignOutComplete,
				);
				expect(response.headers.get('Location')).toBe(expectedRedirect);
			}

			if (!state || !pkce) {
				expect(mockCreateErrorSearchParamsString).toHaveBeenCalledWith({
					error: SIGN_IN_TIMEOUT_ERROR_CODE,
					errorDescription: SIGN_IN_TIMEOUT_ERROR_MESSAGE,
				});
			}
		},
	);

	it('returns a 500 response when exchangeAuthNTokens returns an error', async () => {
		const mockCode = 'code';
		const mockPkce = 'pkce';
		const mockSignInCallbackUrl =
			'https://example.com/api/auth/sign-in-callback';
		const mockError = 'invalid_grant';
		mockParseSignInCallbackUrl.mockReturnValueOnce({
			code: mockCode,
			state: 'not_important_for_this_test',
			error: null,
			errorDescription: null,
		});
		mockGetCookieValuesFromRequest.mockReturnValueOnce({
			[STATE_COOKIE_NAME]: 'not_important_for_this_test',
			[PKCE_COOKIE_NAME]: mockPkce,
		});
		mockResolveRedirectSignInUrl.mockReturnValueOnce(mockSignInCallbackUrl);
		mockExchangeAuthNTokens.mockResolvedValueOnce({
			error: mockError,
		});

		const response = await handleSignInCallbackRequest({
			request: new NextRequest(new URL(mockSignInCallbackUrl)),
			handlerInput: mockHandlerInput,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			setCookieOptions: mockSetCookieOptions,
			origin: mockOrigin,
		});

		expect(response.status).toBe(500);
		expect(await response.text()).toBe(mockError);

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
		[
			{ ...mockHandlerInput, redirectOnSignInComplete: '' },
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
				maxAge: 3600,
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
				maxAge: -1,
			};
			mockCreateAuthFlowProofCookiesRemoveOptions.mockReturnValueOnce(
				mockCreateAuthFlowProofCookiesRemoveOptionsResult,
			);
			mockParseSignInCallbackUrl.mockReturnValueOnce({
				code: mockCode,
				state: 'not_important_for_this_test',
				error: null,
				errorDescription: null,
			});
			mockGetCookieValuesFromRequest.mockReturnValueOnce({
				[STATE_COOKIE_NAME]: 'not_important_for_this_test',
				[PKCE_COOKIE_NAME]: mockPkce,
			});
			mockResolveRedirectSignInUrl.mockReturnValueOnce(mockSignInCallbackUrl);
			mockExchangeAuthNTokens.mockResolvedValueOnce(mockExchangeTokenPayload);
			mockAppendSetCookieHeaders.mockImplementationOnce(headers => {
				headers.append('Set-cookie', 'mock-cookie-1');
				headers.append('Set-cookie', 'mock-cookie-2');
			});
			mockCreateRedirectionIntermediary.mockImplementationOnce(
				({ redirectTo: redirectOnSignInComplete }) =>
					`<html>redirect to ${redirectOnSignInComplete}</html>`,
			);

			const response = await handleSignInCallbackRequest({
				request: new NextRequest(new URL(mockSignInCallbackUrl)),
				handlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			// verify the response
			expect(response.status).toBe(200);
			expect(response.headers.get('Set-Cookie')).toBe(
				'mock-cookie-1, mock-cookie-2',
			);
			expect(response.headers.get('Content-Type')).toBe('text/html');
			expect(await response.text()).toBe(expectedHtml);

			// verify calls to the dependencies
			expect(mockCreateTokenCookies).toHaveBeenCalledWith({
				tokensPayload: mockExchangeTokenPayload,
				userPoolClientId: mockUserPoolClientId,
			});
			expect(mockCreateTokenCookiesSetOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
				mockOrigin,
			);
			expect(mockCreateSignInFlowProofCookies).toHaveBeenCalledWith({
				state: '',
				pkce: '',
			});
			expect(mockCreateAuthFlowProofCookiesRemoveOptions).toHaveBeenCalledWith(
				mockSetCookieOptions,
			);

			expect(mockAppendSetCookieHeaders).toHaveBeenCalledTimes(2);
			expect(mockAppendSetCookieHeaders).toHaveBeenNthCalledWith(
				1,
				expect.any(Headers),
				mockCreateTokenCookiesResult,
				mockCreateTokenCookiesSetOptionsResult,
			);
			expect(mockAppendSetCookieHeaders).toHaveBeenNthCalledWith(
				2,
				expect.any(Headers),
				mockCreateSignInFlowProofCookiesResult,
				mockCreateAuthFlowProofCookiesRemoveOptionsResult,
			);
			expect(mockCreateRedirectionIntermediary).toHaveBeenCalledWith({
				redirectTo: expectedFinalRedirect,
			});
			expect(mockGetRedirectOrDefault).toHaveBeenCalledWith(
				handlerInput.redirectOnSignInComplete,
			);
		},
	);
});
