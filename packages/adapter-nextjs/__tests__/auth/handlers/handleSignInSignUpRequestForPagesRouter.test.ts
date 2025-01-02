/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';
import { CookieStorage } from 'aws-amplify/adapter-core';
import { NextApiRequest } from 'next';

import { handleSignInSignUpRequestForPagesRouter } from '../../../src/auth/handlers/handleSignInSignUpRequestForPagesRouter';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesSetOptions,
	createAuthFlowProofs,
	createAuthorizeEndpoint,
	createSignInFlowProofCookies,
	createSignUpEndpoint,
	createUrlSearchParamsForSignInSignUp,
} from '../../../src/auth/utils';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeadersToNextApiResponse = jest.mocked(
	appendSetCookieHeadersToNextApiResponse,
);
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

	const {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponseRedirect,
		mockResponse,
	} = createMockNextApiResponse();

	afterEach(() => {
		mockAppendSetCookieHeadersToNextApiResponse.mockClear();
		mockCreateAuthFlowProofCookiesSetOptions.mockClear();
		mockCreateAuthFlowProofs.mockClear();
		mockCreateAuthorizeEndpoint.mockClear();
		mockCreateSignInFlowProofCookies.mockClear();
		mockCreateSignUpEndpoint.mockClear();
		mockCreateUrlSearchParamsForSignInSignUp.mockClear();
		mockToCodeChallenge.mockClear();

		mockResponseAppendHeader.mockClear();
		mockResponseEnd.mockClear();
		mockResponseStatus.mockClear();
		mockResponseSend.mockClear();
		mockResponseRedirect.mockClear();
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
			mockAppendSetCookieHeadersToNextApiResponse.mockImplementationOnce(
				response => {
					response.appendHeader('Set-Cookie', 'mockCookieName=mockValue');
				},
			);
			const mockRequest = {
				url: 'https://example.com/api/auth/sign-in',
			} as unknown as NextApiRequest;

			handleSignInSignUpRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				userPoolClientId: mockUserPoolClientId,
				oAuthConfig: mockOAuthConfig,
				customState: mockCustomState,
				origin: mockOrigin,
				setCookieOptions: mockSetCookieOptions,
				type,
			});

			// verify the returned response
			expect(mockResponseRedirect).toHaveBeenCalledWith(
				302,
				type === 'signIn'
					? 'https://id.amazoncognito.com/oauth2/authorize'
					: 'https://id.amazoncognito.com/signup',
			);
			expect(mockResponseAppendHeader).toHaveBeenCalledWith(
				'Set-Cookie',
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

			expect(mockAppendSetCookieHeadersToNextApiResponse).toHaveBeenCalledWith(
				mockResponse,
				mockCreateSignInFlowProofCookiesResult,
				mockCreateAuthFlowProofCookiesSetOptionsResult,
			);
		},
	);
});
