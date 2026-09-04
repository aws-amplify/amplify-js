// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { getCurrentUser, signIn } from '../../../src/providers/cognito';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import { createInitiateAuthClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthErrorCodes } from '../../../src/common/AuthErrorStrings';

import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/tokenProvider');

describe('signIn API error path cases:', () => {
	// assert mocks
	const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);
	const mockInitiateAuth = jest.fn();

	const mockedGetCurrentUser = getCurrentUser as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockCreateInitiateAuthClient.mockReturnValueOnce(mockInitiateAuth);
	});

	afterEach(() => {
		mockedGetCurrentUser.mockReset();
		mockInitiateAuth.mockReset();
	});

	it('does not throw UserAlreadyAuthenticatedException when a user is already signed-in (multi-session)', async () => {
		// Multi-session (HLD §6.1): a native signIn for a second user must succeed
		// and be added to the roster head instead of throwing
		// UserAlreadyAuthenticatedException. The gate has been removed from signIn
		// (the OAuth prompt-gate on signInWithRedirect is unaffected). Here we let
		// the SRP flow resolve to a challenge next step so the call resolves without
		// exercising token caching / Hub dispatch.
		mockedGetCurrentUser.mockResolvedValue({
			username: 'username',
			userId: 'userId',
		});
		const handleUserSRPAuthFlowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockResolvedValue({
				ChallengeName: 'SMS_MFA',
				ChallengeParameters: {},
				AuthenticationResult: undefined,
				Session: '1234',
				$metadata: {},
			});

		const result = await signIn({ username: 'username', password: 'password' });

		expect(result.nextStep.signInStep).toBe('CONFIRM_SIGN_IN_WITH_SMS_CODE');

		handleUserSRPAuthFlowSpy.mockRestore();
		mockedGetCurrentUser.mockClear();
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await signIn({ username: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignInUsername);
		}
	});

	it('should throw an error when password is not empty and authFlow is CUSTOM_WITHOUT_SRP', async () => {
		expect.assertions(2);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					authFlowType: 'CUSTOM_WITHOUT_SRP',
				},
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.CustomAuthSignInPassword);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		mockInitiateAuth.mockImplementation(() => {
			throw getMockError(InitiateAuthException.InvalidParameterException);
		});

		const signInResultPromise = signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});

		expect(signInResultPromise).rejects.toThrow(
			new AuthError({
				name: InitiateAuthException.InvalidParameterException,
				message: 'Error message',
			}),
		);
	});
	it('should throw an error when sign in step is MFA_SETUP and there are no valid setup options', async () => {
		mockInitiateAuth.mockImplementation(() => ({
			ChallengeName: 'MFA_SETUP',
			ChallengeParameters: {
				MFAS_CAN_SETUP: '["SMS_MFA"]',
			},
			$metadata: {},
		}));

		const signInResultPromise = signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				authFlowType: 'USER_PASSWORD_AUTH',
			},
		});

		expect(signInResultPromise).rejects.toThrow(
			new AuthError({
				name: AuthErrorCodes.SignInException,
				message: 'Cannot initiate MFA setup from available types: SMS',
			}),
		);
	});
});
