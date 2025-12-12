// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for auth flows with UserContextData on React Native.
 * These tests verify that signIn, signUp, and forgotPassword (resetPassword)
 * include UserContextData when the native ASF module is available.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { Amplify } from '@aws-amplify/core';

import { resetPassword, signIn, signUp } from '../../../src/providers/cognito';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
import {
	createForgotPasswordClient,
	createInitiateAuthClient,
	createRespondToAuthChallengeClient,
	createSignUpClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import * as userContextDataModule from '../../../src/providers/cognito/utils/userContextData';

import { authAPITestParams } from './testUtils/authApiTestParams';

// Mock service clients
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

// Mock SRP utilities
jest.mock('../../../src/providers/cognito/utils/srp', () => ({
	...jest.requireActual('../../../src/providers/cognito/utils/srp'),
	getAuthenticationHelper: jest.fn(() => ({
		A: { toString: jest.fn() },
		getPasswordAuthenticationKey: jest.fn(),
	})),
	getSignatureString: jest.fn(),
}));

// Mock browser detection to simulate React Native environment
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

describe('Auth flows with UserContextData (React Native)', () => {
	const mockEncodedData = 'nativeEncodedContextData123';
	let getUserContextDataSpy: jest.SpyInstance;

	beforeAll(() => {
		cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
		Amplify.configure({ Auth: authConfig });
	});

	beforeEach(() => {
		jest.clearAllMocks();
		// Spy on getUserContextData to control its return value
		getUserContextDataSpy = jest.spyOn(
			userContextDataModule,
			'getUserContextData',
		);
	});

	afterEach(() => {
		getUserContextDataSpy.mockRestore();
	});

	describe('signIn with UserContextData', () => {
		const mockInitiateAuth = jest.fn();
		const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);
		const mockRespondToAuthChallenge = jest.fn();
		const mockCreateRespondToAuthChallengeClient = jest.mocked(
			createRespondToAuthChallengeClient,
		);

		beforeEach(() => {
			mockInitiateAuth.mockResolvedValue({
				ChallengeName: 'PASSWORD_VERIFIER',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					USER_ID_FOR_SRP: authAPITestParams.user1.username,
				},
			});
			mockCreateInitiateAuthClient.mockReturnValue(mockInitiateAuth);
			mockRespondToAuthChallenge.mockResolvedValue(
				authAPITestParams.RespondToAuthChallengeCommandOutput,
			);
			mockCreateRespondToAuthChallengeClient.mockReturnValue(
				mockRespondToAuthChallenge,
			);
		});

		afterEach(() => {
			mockInitiateAuth.mockClear();
			mockCreateInitiateAuthClient.mockClear();
			mockRespondToAuthChallenge.mockClear();
			mockCreateRespondToAuthChallengeClient.mockClear();
		});

		it('should include UserContextData when native module returns data', async () => {
			// Given: getUserContextData returns encoded data (simulating native module available)
			getUserContextDataSpy.mockReturnValue({ EncodedData: mockEncodedData });

			// When: signIn is called
			try {
				await signIn({
					username: authAPITestParams.user1.username,
					password: authAPITestParams.user1.password,
				});
			} catch {
				// We only care about the request contents
			}

			// Then: InitiateAuth should be called with UserContextData
			expect(mockInitiateAuth).toHaveBeenCalledWith(
				expect.objectContaining({
					region: 'us-west-2',
				}),
				expect.objectContaining({
					UserContextData: {
						EncodedData: mockEncodedData,
					},
				}),
			);
		});

		it('should proceed without UserContextData when native module is unavailable', async () => {
			// Given: getUserContextData returns undefined (simulating native module unavailable)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: signIn is called
			const result = await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});

			// Then: signIn should complete successfully
			expect(result).toEqual(authAPITestParams.signInResult());
		});

		it('should proceed without UserContextData when native module returns null', async () => {
			// Given: getUserContextData returns undefined (native module returns null)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: signIn is called
			const result = await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});

			// Then: signIn should complete successfully
			expect(result).toEqual(authAPITestParams.signInResult());
		});
	});

	describe('signUp with UserContextData', () => {
		const mockSignUp = jest.fn();
		const mockCreateSignUpClient = jest.mocked(createSignUpClient);

		beforeEach(() => {
			mockSignUp.mockResolvedValue(authAPITestParams.signUpHttpCallResult);
			mockCreateSignUpClient.mockReturnValue(mockSignUp);
		});

		afterEach(() => {
			mockSignUp.mockClear();
			mockCreateSignUpClient.mockClear();
		});

		it('should include UserContextData when native module returns data', async () => {
			// Given: getUserContextData returns encoded data (simulating native module available)
			getUserContextDataSpy.mockReturnValue({ EncodedData: mockEncodedData });

			// When: signUp is called
			await signUp({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					userAttributes: { email: authAPITestParams.user1.email },
				},
			});

			// Then: SignUp should be called with UserContextData
			expect(mockSignUp).toHaveBeenCalledWith(
				expect.objectContaining({
					region: 'us-west-2',
				}),
				expect.objectContaining({
					UserContextData: {
						EncodedData: mockEncodedData,
					},
				}),
			);
		});

		it('should proceed without UserContextData when native module is unavailable', async () => {
			// Given: getUserContextData returns undefined (simulating native module unavailable)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: signUp is called
			const result = await signUp({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					userAttributes: { email: authAPITestParams.user1.email },
				},
			});

			// Then: signUp should complete successfully
			expect(result.isSignUpComplete).toBe(false);
			expect(result.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
		});

		it('should proceed without UserContextData when native module returns null', async () => {
			// Given: getUserContextData returns undefined (native module returns null)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: signUp is called
			const result = await signUp({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					userAttributes: { email: authAPITestParams.user1.email },
				},
			});

			// Then: signUp should complete successfully
			expect(result.isSignUpComplete).toBe(false);
			expect(result.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
		});
	});

	describe('forgotPassword (resetPassword) with UserContextData', () => {
		const mockForgotPassword = jest.fn();
		const mockCreateForgotPasswordClient = jest.mocked(
			createForgotPasswordClient,
		);

		beforeEach(() => {
			mockForgotPassword.mockResolvedValue(
				authAPITestParams.resetPasswordHttpCallResult,
			);
			mockCreateForgotPasswordClient.mockReturnValue(mockForgotPassword);
		});

		afterEach(() => {
			mockForgotPassword.mockClear();
			mockCreateForgotPasswordClient.mockClear();
		});

		it('should include UserContextData when native module returns data', async () => {
			// Given: getUserContextData returns encoded data (simulating native module available)
			getUserContextDataSpy.mockReturnValue({ EncodedData: mockEncodedData });

			// When: resetPassword is called
			await resetPassword({
				username: authAPITestParams.user1.username,
			});

			// Then: ForgotPassword should be called with UserContextData
			expect(mockForgotPassword).toHaveBeenCalledWith(
				expect.objectContaining({
					region: 'us-west-2',
				}),
				expect.objectContaining({
					UserContextData: {
						EncodedData: mockEncodedData,
					},
				}),
			);
		});

		it('should proceed without UserContextData when native module is unavailable', async () => {
			// Given: getUserContextData returns undefined (simulating native module unavailable)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: resetPassword is called
			const result = await resetPassword({
				username: authAPITestParams.user1.username,
			});

			// Then: resetPassword should complete successfully
			expect(result).toEqual(authAPITestParams.resetPasswordResult);
		});

		it('should proceed without UserContextData when native module returns null', async () => {
			// Given: getUserContextData returns undefined (native module returns null)
			getUserContextDataSpy.mockReturnValue(undefined);

			// When: resetPassword is called
			const result = await resetPassword({
				username: authAPITestParams.user1.username,
			});

			// Then: resetPassword should complete successfully
			expect(result).toEqual(authAPITestParams.resetPasswordResult);
		});
	});
});
