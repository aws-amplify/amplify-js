/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { handleSignInSignUpRequest } from '../../../src/auth/handlers/handleSignInSignUpRequest';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesSetOptions,
	createAuthFlowProofs,
	createAuthorizeEndpoint,
	createSignInFlowProofCookies,
	createSignUpEndpoint,
	createUrlSearchParamsForSignInSignUp,
} from '../../../src/auth/utils';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeaders = jest.mocked(appendSetCookieHeaders);
const mockCreateAuthFlowProofCookiesSetOptions = jest.mocked(
	createAuthFlowProofCookiesSetOptions,
);
const mockCreateAuthFlowProofs = jest.mocked(createAuthFlowProofs);
const mockCreateAuthorizeEndpoint = jest.mocked(createAuthorizeEndpoint);
const mockCreateSignInFlowProofCookies = jest.mocked(
	createSignInFlowProofCookies,
);
const mockCreateSignUpEndpoint = jest.mocked(createSignUpEndpoint);
const mockCreateUrlSearchParamsForSignInSignUp = jest.mocked(
	createUrlSearchParamsForSignInSignUp,
);

describe('handleSignInSignUpRequest', () => {
	const mockCustomState = 'mockCustomState';
	const mockUserPoolClientId = 'mockUserPoolClientId';
	const mockOAuthConfig = { domain: 'mockDomain' } as unknown as OAuthConfig;
	const mockOrigin = 'https://example.com';
	const mockSetCookieOptions: CookieStorage.SetCookieOptions = {
		domain: '.example.com',
	};
	const mockToCodeChallenge = jest.fn(() => 'mockCodeChallenge');

	afterEach(() => {
		mockAppendSetCookieHeaders.mockClear();
		mockCreateAuthFlowProofCookiesSetOptions.mockClear();
		mockCreateAuthFlowProofs.mockClear();
		mockCreateAuthorizeEndpoint.mockClear();
		mockCreateSignInFlowProofCookies.mockClear();
		mockCreateSignUpEndpoint.mockClear();
		mockCreateUrlSearchParamsForSignInSignUp.mockClear();
		mockToCodeChallenge.mockClear();
	});

	test.each(['signIn' as const, 'signUp' as const])(
		'when type is %s it calls dependencies with correct params and returns a 302 response',
		async type => {
			const mockCreateAuthFlowProofsResult = {
				codeVerifier: {
					value: 'mockCodeVerifier',
					method: 'S256' as const,
					toCodeChallenge: jest.fn(),
				},
				state: 'mockState',
			};
			mockCreateAuthFlowProofs.mockReturnValueOnce(
				mockCreateAuthFlowProofsResult,
			);
			const mockCreateUrlSearchParamsForSignInSignUpResult =
				new URLSearchParams([['value', 'isNotImportant']]);
			mockCreateUrlSearchParamsForSignInSignUp.mockReturnValueOnce(
				mockCreateUrlSearchParamsForSignInSignUpResult,
			);
			mockCreateAuthorizeEndpoint.mockReturnValueOnce(
				'https://id.amazoncognito.com/oauth2/authorize',
			);
			mockCreateSignUpEndpoint.mockReturnValueOnce(
				'https://id.amazoncognito.com/signup',
			);
			const mockCreateSignInFlowProofCookiesResult = [
				{ name: 'mockCookieName', value: 'mockValue' },
			];
			mockCreateSignInFlowProofCookies.mockReturnValueOnce(
				mockCreateSignInFlowProofCookiesResult,
			);
			const mockCreateAuthFlowProofCookiesSetOptionsResult = {
				domain: '.example.com',
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax' as const,
				expires: new Date(),
			};
			mockCreateAuthFlowProofCookiesSetOptions.mockReturnValueOnce(
				mockCreateAuthFlowProofCookiesSetOptionsResult,
			);
			mockAppendSetCookieHeaders.mockImplementationOnce(headers => {
				headers.set('Set-Cookie', 'mockCookieName=mockValue');
			});
			const mockRequest = new Request('https://example.com/api/auth/sign-in');

			const response = await handleSignInSignUpRequest({
				request: mockRequest,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				customState: mockCustomState,
				origin: mockOrigin,
				setCookieOptions: mockSetCookieOptions,
				type,
			});

			// verify the returned response
			expect(response.status).toBe(302);
			expect(response.headers.get('Location')).toBe(
				type === 'signIn'
					? 'https://id.amazoncognito.com/oauth2/authorize'
					: 'https://id.amazoncognito.com/signup',
			);
			expect(response.headers.get('Set-Cookie')).toBe(
				'mockCookieName=mockValue',
			);

			// verify the dependencies were called with correct params
			expect(mockCreateAuthFlowProofs).toHaveBeenCalledWith({
				customState: mockCustomState,
			});
			expect(mockCreateUrlSearchParamsForSignInSignUp).toHaveBeenCalledWith({
				url: mockRequest.url,
				oAuthConfig: mockOAuthConfig,
				userPoolClientId: mockUserPoolClientId,
				state: mockCreateAuthFlowProofsResult.state,
				origin: mockOrigin,
				codeVerifier: mockCreateAuthFlowProofsResult.codeVerifier,
			});

			if (type === 'signIn') {
				expect(mockCreateAuthorizeEndpoint).toHaveBeenCalledWith(
					mockOAuthConfig.domain,
					mockCreateUrlSearchParamsForSignInSignUpResult,
				);
			} else {
				expect(mockCreateSignUpEndpoint).toHaveBeenCalledWith(
					mockOAuthConfig.domain,
					mockCreateUrlSearchParamsForSignInSignUpResult,
				);
			}

			expect(mockAppendSetCookieHeaders).toHaveBeenCalledWith(
				expect.any(Headers),
				mockCreateSignInFlowProofCookiesResult,
				mockCreateAuthFlowProofCookiesSetOptionsResult,
			);
		},
	);
});
