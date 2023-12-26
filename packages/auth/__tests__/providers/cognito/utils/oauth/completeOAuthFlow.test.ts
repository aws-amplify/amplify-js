// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, decodeJWT } from '@aws-amplify/core';
import { handleFailure } from '../../../../../src/providers/cognito/utils/oauth/handleFailure';
import { validateState } from '../../../../../src/providers/cognito/utils/oauth/validateState';
import { resolveAndClearInflightPromises } from '../../../../../src/providers/cognito/utils/oauth/inflightPromise';
import { oAuthStore } from '../../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { cacheCognitoTokens } from '../../../../../src/providers/cognito/tokenProvider/cacheTokens';
import { AuthError } from '../../../../../src/errors/AuthError';
import { AuthErrorTypes } from '../../../../../src/types/Auth';
import { OAuthStore } from '../../../../../src/providers/cognito/utils/types';
import { cognitoUserPoolsTokenProvider } from '../../../../../src/providers/cognito/tokenProvider/tokenProvider';

import { completeOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthFlow';

jest.mock('@aws-amplify/core', () => ({
	Hub: {
		dispatch: jest.fn(),
	},
	decodeJWT: jest.fn(),
	ConsoleLogger: jest.fn(),
}));
jest.mock('../../../../../src/providers/cognito/utils/oauth//handleFailure');
jest.mock('../../../../../src/providers/cognito/utils/oauth/validateState');
jest.mock('../../../../../src/providers/cognito/utils/oauth/inflightPromise');
jest.mock('../../../../../src/providers/cognito/apis/getCurrentUser');
jest.mock('../../../../../src/providers/cognito/tokenProvider/cacheTokens');
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/oAuthStore',
	() => ({
		oAuthStore: {
			setAuthConfig: jest.fn(),
			storeOAuthInFlight: jest.fn(),
			storeOAuthState: jest.fn(),
			storePKCE: jest.fn(),
			loadOAuthInFlight: jest.fn(),
			loadOAuthSignIn: jest.fn(),
			storeOAuthSignIn: jest.fn(),
			loadOAuthState: jest.fn(),
			loadPKCE: jest.fn(),
			clearOAuthData: jest.fn(),
			clearOAuthInflightData: jest.fn(),
		} as OAuthStore,
	})
);
jest.mock(
	'../../../../../src/providers/cognito/tokenProvider/tokenProvider',
	() => ({
		cognitoUserPoolsTokenProvider: {
			setWaitForInflightOAuth: jest.fn(),
		},
	})
);

const mockHandleFailure = handleFailure as jest.Mock;
const mockValidateState = validateState as jest.Mock;
const mockResolveAndClearInflightPromises =
	resolveAndClearInflightPromises as jest.Mock;
const mockCacheCognitoTokens = cacheCognitoTokens as jest.Mock;
const mockHubDispatch = Hub.dispatch as jest.Mock;
const mockDecodeJWT = decodeJWT as jest.Mock;
// const mockCreateOAuthError = createOAuthError as jest.Mock;

describe('completeOAuthFlow', () => {
	let windowSpy = jest.spyOn(window, 'window', 'get');
	const mockFetch = jest.fn();
	const mockReplaceState = jest.fn();

	beforeAll(() => {
		(global as any).fetch = mockFetch;
		windowSpy.mockImplementation(
			() =>
				({
					history: {
						replaceState: mockReplaceState,
					},
				}) as any
		);
	});

	afterEach(() => {
		mockHandleFailure.mockClear();
		mockResolveAndClearInflightPromises.mockClear();
		mockFetch.mockClear();
		mockReplaceState.mockClear();
		mockHubDispatch.mockClear();

		(oAuthStore.clearOAuthData as jest.Mock).mockClear();
		(oAuthStore.clearOAuthInflightData as jest.Mock).mockClear();
		(oAuthStore.clearOAuthData as jest.Mock).mockClear();
		(oAuthStore.storeOAuthSignIn as jest.Mock).mockClear();
		(
			cognitoUserPoolsTokenProvider.setWaitForInflightOAuth as jest.Mock
		).mockClear();
	});

	it('handles error presented in the redirect url', async () => {
		const expectedErrorMessage = 'some error message';

		expect(
			completeOAuthFlow({
				currentUrl: `http://localhost:3000?error=true&error_description=${expectedErrorMessage}`,
				userAgentValue: 'UserAgent',
				clientId: 'clientId',
				redirectUri: 'http://localhost:3000/',
				responseType: 'code',
				domain: 'localhost:3000',
			})
		).rejects.toThrow(expectedErrorMessage);
	});

	describe('handleCodeFlow', () => {
		const expectedState = 'someState123';
		const testInput = {
			currentUrl: `http://localhost:3000?code=12345&state=${expectedState}`,
			userAgentValue: 'UserAgent',
			clientId: 'clientId',
			redirectUri: 'http://localhost:3000/',
			responseType: 'code',
			domain: 'oauth.domain.com',
		};

		it('throws when `code` is not presented in the redirect url', () => {
			expect(
				completeOAuthFlow({
					...testInput,
					currentUrl: `http://localhost:3000?state=someState123`,
				})
			).rejects.toThrow('User cancelled OAuth flow.');
		});

		it('throws when `state` is not presented in the redirect url', async () => {
			expect(
				completeOAuthFlow({
					...testInput,
					currentUrl: `http://localhost:3000?code=123`,
				})
			).rejects.toThrow('User cancelled OAuth flow.');
		});

		it('handles error when `validateState` fails', async () => {
			const expectedErrorMessage = 'some error';
			mockValidateState.mockImplementationOnce(() => {
				throw new AuthError({
					name: AuthErrorTypes.OAuthSignInError,
					message: expectedErrorMessage,
				});
			});

			await expect(completeOAuthFlow(testInput)).rejects.toThrow(
				expectedErrorMessage
			);
			expect(mockValidateState).toHaveBeenCalledWith(expectedState);
		});

		it('exchanges auth token and completes the oauth process', async () => {
			const expectedTokens = {
				access_token: 'access_token',
				id_token: 'id_token',
				refresh_token: 'refresh_token',
				token_type: 'token_type',
				expires_in: 'expires_in',
			};
			mockValidateState.mockReturnValueOnce('myState-valid_state');
			(oAuthStore.loadPKCE as jest.Mock).mockResolvedValueOnce('pkce23234a');
			const mockJsonMethod = jest.fn(() => Promise.resolve(expectedTokens));
			mockDecodeJWT.mockReturnValueOnce({
				payload: {
					username: 'testuser',
				},
			});
			mockFetch.mockResolvedValueOnce({
				json: mockJsonMethod,
			});

			await completeOAuthFlow(testInput);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://oauth.domain.com/oauth2/token',
				expect.objectContaining({
					method: 'POST',
					body: 'grant_type=authorization_code&code=12345&client_id=clientId&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&code_verifier=pkce23234a',
				})
			);
			expect(mockCacheCognitoTokens).toHaveBeenLastCalledWith({
				username: 'testuser',
				AccessToken: expectedTokens.access_token,
				IdToken: expectedTokens.id_token,
				RefreshToken: expectedTokens.refresh_token,
				TokenType: expectedTokens.token_type,
				ExpiresIn: expectedTokens.expires_in,
			});
			expect(mockReplaceState).toHaveBeenCalledWith(
				{},
				'',
				testInput.redirectUri
			);

			expect(oAuthStore.clearOAuthData).toHaveBeenCalledTimes(1);
			expect(oAuthStore.storeOAuthSignIn).toHaveBeenCalledWith(true, undefined);

			expect(mockHubDispatch).toHaveBeenCalledTimes(3);
			expect(mockResolveAndClearInflightPromises).toHaveBeenCalledTimes(1);
		});

		it('throws when `fetch` call resolves error', async () => {
			const mockError = {
				error: true,
				error_message: 'some error',
			};
			const mockJsonMethod = jest.fn(() => Promise.resolve(mockError));
			mockFetch.mockResolvedValueOnce({
				json: mockJsonMethod,
			});

			expect(completeOAuthFlow(testInput)).rejects.toThrow(
				mockError.error_message
			);
		});
	});

	describe('handleImplicitFlow', () => {
		const testInput = {
			currentUrl: `http://localhost:3000#access_token=accessToken123`,
			userAgentValue: 'UserAgent',
			clientId: 'clientId',
			redirectUri: 'http://localhost:3000/',
			responseType: 'non-code',
			domain: 'oauth.domain.com',
		};

		it('throws when error and error_description are presented in the redirect url', () => {
			const expectedErrorMessage = 'invalid_scope';
			expect(
				completeOAuthFlow({
					...testInput,
					currentUrl: `http://localhost:3000#error_description=${expectedErrorMessage}&error=invalid_request`,
				})
			).rejects.toThrow(expectedErrorMessage);
		});

		it('throws when access_token is not presented in the redirect url', () => {
			expect(
				completeOAuthFlow({
					...testInput,
					currentUrl: `http://localhost:3000#`,
				})
			).rejects.toThrow('No access token returned from OAuth flow.');
		});

		it('handles error when `validateState` fails', async () => {
			const expectedErrorMessage = 'some error';
			mockValidateState.mockImplementationOnce(() => {
				throw new AuthError({
					name: AuthErrorTypes.OAuthSignInError,
					message: expectedErrorMessage,
				});
			});

			await expect(completeOAuthFlow(testInput)).rejects.toThrow(
				expectedErrorMessage
			);
		});

		it('completes the inflight oauth flow', async () => {
			const expectedAccessToken = 'access_token';
			const expectedIdToken = 'id_token';
			const expectedTokenType = 'token_type';
			const expectedExpiresIn = 'expires_in';

			mockDecodeJWT.mockReturnValueOnce({
				payload: {
					username: 'testuser',
				},
			});

			await completeOAuthFlow({
				...testInput,
				currentUrl: `http://localhost:3000#access_token=${expectedAccessToken}&id_token=${expectedIdToken}&token_type=${expectedTokenType}&expires_in=${expectedExpiresIn}`,
			});

			expect(mockCacheCognitoTokens).toHaveBeenCalledWith({
				username: 'testuser',
				AccessToken: expectedAccessToken,
				IdToken: expectedIdToken,
				TokenType: expectedTokenType,
				ExpiresIn: expectedExpiresIn,
			});

			expect(oAuthStore.clearOAuthData).toHaveBeenCalledTimes(1);
			expect(oAuthStore.storeOAuthSignIn).toHaveBeenCalledWith(true, undefined);
			expect(mockResolveAndClearInflightPromises).toHaveBeenCalledTimes(1);
			expect(
				cognitoUserPoolsTokenProvider.setWaitForInflightOAuth
			).toHaveBeenCalledTimes(1);

			const waitForInflightOAuth = (
				cognitoUserPoolsTokenProvider.setWaitForInflightOAuth as jest.Mock
			).mock.calls[0][0];
			expect(typeof waitForInflightOAuth).toBe('function');
			expect(waitForInflightOAuth()).resolves.toBeUndefined();

			expect(mockHubDispatch).toHaveBeenCalledTimes(2);
			expect(mockReplaceState).toHaveBeenCalledWith(
				{},
				'',
				testInput.redirectUri
			);
		});
	});
});
