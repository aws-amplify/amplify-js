// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import { signInWithUserAuth } from '../../../src/providers/cognito/apis/signInWithUserAuth';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
import { InitiateAuthCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

jest.mock('../../../src/providers/cognito/utils/signInHelpers', () => ({
	...jest.requireActual('../../../src/providers/cognito/utils/signInHelpers'),
	cleanActiveSignInState: jest.fn(),
	setActiveSignInState: jest.fn(),
	getNewDeviceMetadata: jest.fn(),
	getActiveSignInUsername: jest.fn(username => username),
}));
jest.mock('../../../src/providers/cognito/tokenProvider/cacheTokens', () => ({
	cacheCognitoTokens: jest.fn(),
}));
jest.mock('../../../src/client/flows/userAuth/handleUserAuthFlow');
jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock('../../../src/providers/cognito/utils/srp', () => {
	return {
		...jest.requireActual('../../../src/providers/cognito/utils/srp'),
		getAuthenticationHelper: jest.fn(() => ({
			A: { toString: jest.fn() },
			getPasswordAuthenticationKey: jest.fn(),
		})),
		getSignatureString: jest.fn(),
	};
});
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
});

describe('signInWithUserAuth API tests', () => {
	// Update how we get the mock
	const { handleUserAuthFlow } = jest.requireMock(
		'../../../src/client/flows/userAuth/handleUserAuthFlow',
	);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('signInWithUserAuth should return a SignInResult when SELECT_CHALLENGE is returned', async () => {
		const mockResponse: InitiateAuthCommandOutput = {
			ChallengeName: 'SELECT_CHALLENGE',
			Session: 'mockSession',
			ChallengeParameters: {},
			AvailableChallenges: ['EMAIL_OTP', 'SMS_OTP'] as any,
			$metadata: {},
		};
		handleUserAuthFlow.mockResolvedValue(mockResponse);

		const result = await signInWithUserAuth({
			username: 'testuser',
		});

		expect(result).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION',
				availableChallenges: ['EMAIL_OTP', 'SMS_OTP'],
			},
		});
		expect(handleUserAuthFlow).toHaveBeenCalledWith({
			username: 'testuser',
			clientMetadata: undefined,
			config: authConfig.Cognito,
			tokenOrchestrator: expect.anything(),
			preferredChallenge: undefined,
			password: undefined,
		});
	});

	test('signInWithUserAuth should handle preferred challenge', async () => {
		const mockResponse: InitiateAuthCommandOutput = {
			ChallengeName: 'EMAIL_OTP',
			Session: 'mockSession',
			ChallengeParameters: {
				CODE_DELIVERY_DELIVERY_MEDIUM: 'EMAIL',
				CODE_DELIVERY_DESTINATION: 'y*****.com',
			},
			$metadata: {},
		};
		handleUserAuthFlow.mockResolvedValue(mockResponse);

		const result = await signInWithUserAuth({
			username: 'testuser',
			options: { preferredChallenge: 'EMAIL_OTP' },
		});

		expect(result).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
				codeDeliveryDetails: {
					deliveryMedium: 'EMAIL',
					destination: 'y*****.com',
				},
			},
		});
		expect(handleUserAuthFlow).toHaveBeenCalledWith({
			username: 'testuser',
			clientMetadata: undefined,
			config: authConfig.Cognito,
			tokenOrchestrator: expect.anything(),
			preferredChallenge: 'EMAIL_OTP',
			password: undefined,
		});
	});

	test('should throw validation error for empty username', async () => {
		await expect(
			signInWithUserAuth({
				username: '', // empty username
			}),
		).rejects.toThrow('username is required to signIn');
	});

	test('should handle successful authentication result', async () => {
		const mockResponse: InitiateAuthCommandOutput = {
			AuthenticationResult: {
				AccessToken: 'mockAccessToken',
				RefreshToken: 'mockRefreshToken',
				IdToken: 'mockIdToken',
				NewDeviceMetadata: {
					DeviceKey: 'deviceKey',
					DeviceGroupKey: 'deviceGroupKey',
				},
			},
			$metadata: {},
		};
		handleUserAuthFlow.mockResolvedValue(mockResponse);

		const result = await signInWithUserAuth({
			username: 'testuser',
		});

		expect(result).toEqual({
			isSignedIn: true,
			nextStep: { signInStep: 'DONE' },
		});
	});

	test('should handle service error with sign in result', async () => {
		const error = new Error('PasswordResetRequiredException');
		error.name = 'PasswordResetRequiredException';
		handleUserAuthFlow.mockRejectedValue(error);

		const result = await signInWithUserAuth({
			username: 'testuser',
		});

		expect(result).toEqual({
			isSignedIn: false,
			nextStep: { signInStep: 'RESET_PASSWORD' },
		});
	});

	test('should throw error when service error has no sign in result', async () => {
		const error = new Error('Unknown error');
		error.name = 'UnknownError';
		handleUserAuthFlow.mockRejectedValue(error);

		await expect(
			signInWithUserAuth({
				username: 'testuser',
			}),
		).rejects.toThrow(AmplifyErrorCode.Unknown);
	});
});
