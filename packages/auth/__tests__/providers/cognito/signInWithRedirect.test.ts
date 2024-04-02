// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
	urlSafeEncode,
	isBrowser,
	ADD_OAUTH_LISTENER,
} from '@aws-amplify/core/internals/utils';
import { assertUserNotAuthenticated } from '../../../src/providers/cognito/utils/signInHelpers';
import {
	generateCodeVerifier,
	generateState,
} from '../../../src/providers/cognito/utils/oauth';
import { getAuthUserAgentValue, openAuthSession } from '../../../src/utils';
import {
	handleFailure,
	oAuthStore,
	completeOAuthFlow,
} from '../../../src/providers/cognito/utils/oauth';
import { attemptCompleteOAuthFlow } from '../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow';
import { createOAuthError } from '../../../src/providers/cognito/utils/oauth/createOAuthError';

import { signInWithRedirect } from '../../../src/providers/cognito/apis/signInWithRedirect';

import type { OAuthStore } from '../../../src/providers/cognito/utils/types';
import { mockAuthConfigWithOAuth } from '../../mockData';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	assertOAuthConfig: jest.fn(),
	assertTokenProviderConfig: jest.fn(),
	urlSafeEncode: jest.fn(),
	isBrowser: jest.fn(() => true),
}));
jest.mock('@aws-amplify/core', () => {
	const { ADD_OAUTH_LISTENER } = jest.requireActual(
		'@aws-amplify/core/internals/utils',
	);
	return {
		Amplify: {
			getConfig: jest.fn(() => mockAuthConfigWithOAuth),
			[ADD_OAUTH_LISTENER]: jest.fn(),
		},
		ConsoleLogger: jest.fn(),
	};
});
jest.mock('../../../src/providers/cognito/utils/signInHelpers');
jest.mock('../../../src/providers/cognito/utils/oauth', () => ({
	...jest.requireActual('../../../src/providers/cognito/utils/oauth'),
	completeOAuthFlow: jest.fn(),
	handleFailure: jest.fn(),
	generateCodeVerifier: jest.fn(),
	generateState: jest.fn(),
}));
jest.mock('../../../src/providers/cognito/utils/oauth/oAuthStore', () => ({
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
}));
jest.mock('../../../src/providers/cognito/utils/oauth/createOAuthError');
jest.mock('../../../src/utils');

const mockAssertOAuthConfig = assertOAuthConfig as jest.Mock;
const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;
const mockUrlSafeEncode = urlSafeEncode as jest.Mock;
const mockAssertUserNotAuthenticated = assertUserNotAuthenticated as jest.Mock;
const mockOpenAuthSession = openAuthSession as jest.Mock;
const mockGenerateCodeVerifier = generateCodeVerifier as jest.Mock;
const mockGenerateState = generateState as jest.Mock;
const mockIsBrowser = isBrowser as jest.Mock;

const mockCompleteOAuthFlow = completeOAuthFlow as jest.Mock;
const mockGetAuthUserAgentValue = getAuthUserAgentValue as jest.Mock;
const mockHandleFailure = handleFailure as jest.Mock;
const mockCreateOAuthError = createOAuthError as jest.Mock;

describe('signInWithRedirect', () => {
	const mockState = 'oauth_state';
	const mockCodeVerifierValue = 'code_verifier_value';
	const mockCodeVerifierMethod = 'S256';
	const mockCodeChallenge = 'code_challenge';
	const mockToCodeChallenge = jest.fn(() => mockCodeChallenge);

	beforeAll(() => {
		mockGenerateState.mockReturnValue(mockState);
		mockGenerateCodeVerifier.mockReturnValue({
			value: mockCodeVerifierValue,
			method: mockCodeVerifierMethod,
			toCodeChallenge: mockToCodeChallenge,
		});
		mockUrlSafeEncode.mockImplementation(customState => customState);
		mockIsBrowser.mockReturnValue(true);
	});

	afterEach(() => {
		mockAssertTokenProviderConfig.mockClear();
		mockAssertOAuthConfig.mockClear();
		mockAssertUserNotAuthenticated.mockClear();
		mockUrlSafeEncode.mockClear();
		mockGenerateState.mockClear();
		mockGenerateCodeVerifier.mockClear();
		mockOpenAuthSession.mockClear();
		mockToCodeChallenge.mockClear();
		mockHandleFailure.mockClear();
		mockCompleteOAuthFlow.mockClear();

		(oAuthStore.setAuthConfig as jest.Mock).mockClear();
		(oAuthStore.storeOAuthInFlight as jest.Mock).mockClear();
		(oAuthStore.storeOAuthState as jest.Mock).mockClear();
		(oAuthStore.storePKCE as jest.Mock).mockClear();
	});

	it('invokes dependent functions with expected parameters', async () => {
		await signInWithRedirect({ provider: 'Google' });

		expect(mockAssertTokenProviderConfig).toHaveBeenCalledTimes(1);
		expect(mockAssertOAuthConfig).toHaveBeenCalledTimes(1);
		expect(oAuthStore.setAuthConfig).toHaveBeenCalledWith(
			mockAuthConfigWithOAuth.Auth.Cognito,
		);
		expect(mockAssertUserNotAuthenticated).toHaveBeenCalledTimes(1);

		expect(mockGenerateState).toHaveBeenCalledTimes(1);
		expect(mockGenerateCodeVerifier).toHaveBeenCalledWith(128);
		expect(oAuthStore.storeOAuthInFlight).toHaveBeenCalledWith(true);
		expect(oAuthStore.storeOAuthState).toHaveBeenCalledWith(mockState);
		expect(oAuthStore.storePKCE).toHaveBeenCalledWith(mockCodeVerifierValue);
		expect(mockToCodeChallenge).toHaveBeenCalledTimes(1);

		expect(mockOpenAuthSession).toHaveBeenCalledTimes(1);
		const [oauthUrl, redirectSignIn, preferPrivateSession] =
			mockOpenAuthSession.mock.calls[0];
		expect(oauthUrl).toStrictEqual(
			'https://oauth.domain.com/oauth2/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&client_id=userPoolClientId&identity_provider=Google&scope=phone%20email%20openid%20profile%20aws.cognito.signin.user.admin&state=oauth_state&code_challenge=code_challenge&code_challenge_method=S256',
		);
		expect(redirectSignIn).toEqual(
			mockAuthConfigWithOAuth.Auth.Cognito.loginWith.oauth.redirectSignIn,
		);
		expect(preferPrivateSession).toBeUndefined();
	});

	it('uses "Cognito" as the default provider if not specified', async () => {
		const expectedDefaultProvider = 'COGNITO';
		await signInWithRedirect();
		const [oauthUrl] = mockOpenAuthSession.mock.calls[0];
		expect(oauthUrl).toStrictEqual(
			`https://oauth.domain.com/oauth2/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&client_id=userPoolClientId&identity_provider=${expectedDefaultProvider}&scope=phone%20email%20openid%20profile%20aws.cognito.signin.user.admin&state=oauth_state&code_challenge=code_challenge&code_challenge_method=S256`,
		);
	});

	it('uses custom provider when specified', async () => {
		const expectedCustomProvider = 'PieAuth';
		await signInWithRedirect({ provider: { custom: expectedCustomProvider } });
		const [oauthUrl] = mockOpenAuthSession.mock.calls[0];
		expect(oauthUrl).toStrictEqual(
			`https://oauth.domain.com/oauth2/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code&client_id=userPoolClientId&identity_provider=${expectedCustomProvider}&scope=phone%20email%20openid%20profile%20aws.cognito.signin.user.admin&state=oauth_state&code_challenge=code_challenge&code_challenge_method=S256`,
		);
	});

	it('uses custom state if specified', async () => {
		const expectedCustomState = 'verify_me';
		await signInWithRedirect({ customState: expectedCustomState });
		expect(mockUrlSafeEncode).toHaveBeenCalledWith(expectedCustomState);
	});

	describe('specifications on Web', () => {
		describe('side effect', () => {
			it('attaches oauth listener to the Amplify singleton', async () => {
				(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValueOnce(
					false,
				);

				expect(Amplify[ADD_OAUTH_LISTENER]).toHaveBeenCalledWith(
					attemptCompleteOAuthFlow,
				);
			});
		});
	});

	describe('specifications on react-native', () => {
		beforeAll(() => {
			mockIsBrowser.mockReturnValue(false);
		});
		it('invokes `completeOAuthFlow` when `openAuthSession`completes', async () => {
			const mockOpenAuthSessionResult = {
				type: 'success',
				url: 'http://redrect-in-react-native.com',
			};
			mockOpenAuthSession.mockResolvedValueOnce(mockOpenAuthSessionResult);

			await signInWithRedirect({
				provider: 'Google',
				options: { preferPrivateSession: true },
			});

			expect(mockCompleteOAuthFlow).toHaveBeenCalledWith(
				expect.objectContaining({
					currentUrl: mockOpenAuthSessionResult.url,
					preferPrivateSession: true,
				}),
			);
			expect(mockGetAuthUserAgentValue).toHaveBeenCalledTimes(1);
		});

		it('invokes `handleFailure` with the error created by `createOAuthError` when `openAuthSession` completes with error', async () => {
			const mockOpenAuthSessionResult = {
				type: 'error',
				error: new Error('some error'),
			};
			mockCreateOAuthError.mockReturnValueOnce(mockOpenAuthSessionResult.error);

			mockOpenAuthSession.mockResolvedValueOnce(mockOpenAuthSessionResult);

			await expect(
				signInWithRedirect({
					provider: 'Google',
					options: { preferPrivateSession: true },
				}),
			).rejects.toThrow(mockOpenAuthSessionResult.error);

			expect(mockCreateOAuthError).toHaveBeenCalledWith(
				String(mockOpenAuthSessionResult.error),
			);
			expect(mockHandleFailure).toHaveBeenCalledWith(
				mockOpenAuthSessionResult.error,
			);
		});

		it('invokes `handleFailure` with the error thrown from `completeOAuthFlow`', async () => {
			const expectedError = new Error('some error');
			const mockOpenAuthSessionResult = {
				type: 'success',
				url: 'https://url.com',
			};
			mockOpenAuthSession.mockResolvedValueOnce(mockOpenAuthSessionResult);
			mockCompleteOAuthFlow.mockRejectedValueOnce(expectedError);

			await expect(
				signInWithRedirect({
					provider: 'Google',
					options: { preferPrivateSession: true },
				}),
			).rejects.toThrow(expectedError);

			expect(mockCompleteOAuthFlow).toHaveBeenCalledWith(
				expect.objectContaining({
					currentUrl: mockOpenAuthSessionResult.url,
				}),
			);
			expect(mockHandleFailure).toHaveBeenCalledWith(expectedError);
		});
		it('should not set the Oauth flag on non-browser environments', async () => {
			const mockOpenAuthSessionResult = {
				type: 'success',
				url: 'http://redrect-in-react-native.com',
			};
			mockOpenAuthSession.mockResolvedValueOnce(mockOpenAuthSessionResult);

			await signInWithRedirect({
				provider: 'Google',
			});

			expect(oAuthStore.storeOAuthInFlight).toHaveBeenCalledTimes(0);
		});
	});

	describe('errors', () => {
		it('rethrows error thrown from `assertTokenProviderConfig`', async () => {
			const mockError = new Error('mock error');
			mockAssertTokenProviderConfig.mockImplementationOnce(() => {
				throw mockError;
			});

			await expect(signInWithRedirect()).rejects.toThrow(mockError);
		});

		it('rethrows error thrown from `assertOAuthConfig`', async () => {
			const mockError = new Error('mock error');
			mockAssertOAuthConfig.mockImplementationOnce(() => {
				throw mockError;
			});

			await expect(signInWithRedirect()).rejects.toThrow(mockError);
		});

		it('rethrow error thrown from `assertUserNotAuthenticated`', async () => {
			const mockError = new Error('mock error');
			mockAssertUserNotAuthenticated.mockImplementationOnce(() => {
				throw mockError;
			});

			await expect(signInWithRedirect()).rejects.toThrow(mockError);
		});
	});
});
