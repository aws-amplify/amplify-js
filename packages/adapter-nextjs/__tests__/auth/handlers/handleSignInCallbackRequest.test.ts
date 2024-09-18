/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server.js';
import { OAuthConfig } from '@aws-amplify/core';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { handleSignInCallbackRequest } from '../../../src/auth/handlers/handleSignInCallbackRequest';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesRemoveOptions,
	createOnSignInCompletedRedirectIntermediate,
	createSignInFlowProofCookies,
	createTokenCookies,
	createTokenCookiesSetOptions,
	exchangeAuthNTokens,
	getCookieValuesFromRequest,
	resolveCodeAndStateFromUrl,
	resolveRedirectSignInUrl,
} from '../../../src/auth/utils';
import { CreateAuthRoutesHandlersInput } from '../../../src/auth/types';
import {
	PKCE_COOKIE_NAME,
	STATE_COOKIE_NAME,
} from '../../../src/auth/constant';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeaders = jest.mocked(appendSetCookieHeaders);
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
const mockGetCookieValuesFromRequest = jest.mocked(getCookieValuesFromRequest);
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

	afterEach(() => {
		mockAppendSetCookieHeaders.mockClear();
		mockCreateAuthFlowProofCookiesRemoveOptions.mockClear();
		mockCreateOnSignInCompletedRedirectIntermediate.mockClear();
		mockCreateSignInFlowProofCookies.mockClear();
		mockCreateTokenCookies.mockClear();
		mockCreateTokenCookiesSetOptions.mockClear();
		mockExchangeAuthNTokens.mockClear();
		mockGetCookieValuesFromRequest.mockClear();
		mockResolveCodeAndStateFromUrl.mockClear();
		mockResolveRedirectSignInUrl.mockClear();
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

			expect(response.status).toBe(400);
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
			mockGetCookieValuesFromRequest.mockReturnValueOnce({
				[STATE_COOKIE_NAME]: clientState,
				[PKCE_COOKIE_NAME]: clientPkce,
			});

			const url = `https://example.com/api/auth/sign-in-callback?state=${state}&code=not_important_for_this_test`;
			const request = new NextRequest(new URL(url));

			const response = await handleSignInCallbackRequest({
				request,
				handlerInput: mockHandlerInput,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				setCookieOptions: mockSetCookieOptions,
				origin: mockOrigin,
			});

			expect(response.status).toBe(400);
			expect(mockResolveCodeAndStateFromUrl).toHaveBeenCalledWith(url);
			expect(mockGetCookieValuesFromRequest).toHaveBeenCalledWith(request, [
				PKCE_COOKIE_NAME,
				STATE_COOKIE_NAME,
			]);
		},
	);

	it('returns a 500 response when exchangeAuthNTokens returns an error', async () => {
		const mockCode = 'code';
		const mockPkce = 'pkce';
		const mockSignInCallbackUrl =
			'https://example.com/api/auth/sign-in-callback';
		const mockError = 'invalid_grant';
		mockResolveCodeAndStateFromUrl.mockReturnValueOnce({
			code: mockCode,
			state: 'not_important_for_this_test',
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
			mockCreateOnSignInCompletedRedirectIntermediate.mockImplementationOnce(
				({ redirectOnSignInComplete }) =>
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
			expect(
				mockCreateOnSignInCompletedRedirectIntermediate,
			).toHaveBeenCalledWith({
				redirectOnSignInComplete: expectedFinalRedirect,
			});
		},
	);
});
