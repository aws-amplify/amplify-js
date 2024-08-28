// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	confirmSignIn,
	getCurrentUser,
	signIn,
} from '../../../src/providers/cognito';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { signInStore } from '../../../src/providers/cognito/utils/signInStore';
import {
	AssociateSoftwareTokenCommandOutput,
	RespondToAuthChallengeCommandOutput,
} from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
import { mfaSetupStore } from '../../../src/providers/cognito/utils/mfaSetupStore';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/apis/getCurrentUser');

//  getCurrentUser is mocked so Hub is able to dispatch a mocked AuthUser
// before returning an `AuthSignInResult`
const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const { username } = authAPITestParams.user1;
const { password } = authAPITestParams.user1;
const session = '1234234232';
const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

describe('local sign-in state management tests', () => {
	const challengeName = 'SMS_MFA';

	beforeEach(() => {
		cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
	});

	test('local state management should return state after signIn returns a ChallengeName', async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: challengeName,
					Session: session,
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				}),
			);

		Amplify.configure({
			Auth: authConfig,
		});
		await signIn({
			username,
			password,
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		expect(localSignInState).toEqual({
			challengeName,
			signInSession: session,
			username,
			signInDetails: {
				loginId: username,
				authFlowType: 'USER_SRP_AUTH',
			},
		});

		handleUserSRPAuthflowSpy.mockClear();
	});

	test('local state management should return empty state after signIn returns an AuthenticationResult', async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput,
			);

		Amplify.configure({
			Auth: authConfig,
		});
		await signIn({
			username,
			password,
		});
		mockedGetCurrentUser.mockImplementationOnce(async () => {
			return {
				username: 'username',
				userId: 'userId',
			};
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		expect(localSignInState).toEqual({
			challengeName: undefined,
			signInSession: undefined,
			username: undefined,
		});

		handleUserSRPAuthflowSpy.mockClear();
		mockedGetCurrentUser.mockClear();
	});
});

describe('mfa setup state management tests', () => {
	const handleChallengeNameSpy = jest.spyOn(
		signInHelpers,
		'handleChallengeName',
	);
	const handleUserSRPAuthFlowSpy = jest.spyOn(
		signInHelpers,
		'handleUserSRPAuthFlow',
	);

	beforeAll(() => {
		Amplify.configure({ Auth: authConfig });
	});

	test('mfa setup state should initialize as undefined', () => {
		const mfaSetupState = mfaSetupStore.getState();

		expect(mfaSetupState).toStrictEqual(undefined);
	});

	test('mfa setup state should be updated with options during first MFA_SETUP challenge', async () => {
		jest.spyOn(signInHelpers, 'handleUserSRPAuthFlow').mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'MFA_SETUP',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					MFAS_CAN_SETUP: '["SMS_MFA","SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
				},
			}),
		);

		await signIn({ username, password });

		const mfaSetupState = mfaSetupStore.getState();

		expect(mfaSetupState).toStrictEqual({
			status: 'IN_PROGRESS',
			options: ['TOTP', 'EMAIL'],
		});
	});

	test('mfa setup state should be updated with selected value during second MFA_SETUP challenge', async () => {
		jest.spyOn(signInHelpers, 'handleUserSRPAuthFlow').mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'MFA_SETUP',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					MFAS_CAN_SETUP: '["SMS_MFA","SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
				},
			}),
		);

		await signIn({ username, password });

		await confirmSignIn({
			challengeResponse: 'EMAIL',
		});

		expect(mfaSetupStore.getState()).toStrictEqual({
			status: 'COMPLETE',
			options: ['TOTP', 'EMAIL'],
			value: 'EMAIL',
		});
	});

	test('mfa setup state should be cleared with successful sign in', async () => {
		handleUserSRPAuthFlowSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeMultipleMfaSetupOutput,
		);

		await signIn({ username, password });

		await confirmSignIn({
			challengeResponse: 'EMAIL',
		});

		handleChallengeNameSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'EMAIL_OTP',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					CODE_DELIVERY_DELIVERY_MEDIUM: 'EMAIL',
					CODE_DELIVERY_DESTINATION: 'j***@a***',
				},
			}),
		);

		await confirmSignIn({
			challengeResponse: 'j***@a***',
		});

		handleChallengeNameSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

		await confirmSignIn({
			challengeResponse: '123456',
		});

		const mfaSetupState = mfaSetupStore.getState();

		expect(mfaSetupState).toStrictEqual(undefined);
	});

	test('mfa setup state should be reset with each sign in attempt', async () => {
		handleUserSRPAuthFlowSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeMultipleMfaSetupOutput,
		);

		await signIn({ username, password });

		await confirmSignIn({
			challengeResponse: 'EMAIL',
		});

		expect(mfaSetupStore.getState()).toStrictEqual({
			status: 'COMPLETE',
			options: ['TOTP', 'EMAIL'],
			value: 'EMAIL',
		});

		handleUserSRPAuthFlowSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

		await signIn({ username, password });

		expect(mfaSetupStore.getState()).toStrictEqual(undefined);
	});

	test('mfa setup state should autocomplete when only one allowed MFA setup option is available (EMAIL_OTP)', async () => {
		handleUserSRPAuthFlowSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'MFA_SETUP',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					MFAS_CAN_SETUP: '["SMS_MFA", "EMAIL_OTP"]',
				},
			}),
		);

		await signIn({ username, password });

		expect(mfaSetupStore.getState()).toStrictEqual({
			status: 'COMPLETE',
			options: ['EMAIL'],
			value: 'EMAIL',
		});
	});
	test('mfa setup state should autocomplete when only one allowed MFA setup option is available (SOFTWARE_TOKEN_MFA)', async () => {
		handleUserSRPAuthFlowSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'MFA_SETUP',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					MFAS_CAN_SETUP: '["SMS_MFA", "SOFTWARE_TOKEN_MFA"]',
				},
			}),
		);

		jest.spyOn(clients, 'associateSoftwareToken').mockImplementationOnce(
			async (): Promise<AssociateSoftwareTokenCommandOutput> => ({
				SecretCode: 'secret-code',
				Session: '12341234',
				$metadata: {},
			}),
		);

		await signIn({ username, password });

		expect(mfaSetupStore.getState()).toStrictEqual({
			status: 'COMPLETE',
			options: ['TOTP'],
			value: 'TOTP',
		});
	});
});
