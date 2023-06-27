// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthSignInStep } from '../../../src/types';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';

Amplify.configure({
	aws_cognito_region: 'us-west-2',
	aws_user_pools_web_client_id: '111111-aaaaa-42d8-891d-ee81a1549398',
	aws_user_pools_id: 'us-west-2_zzzzz',
});

describe('confirmSignIn API happy path cases', () => {
	let handleChallengeNameSpy;
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
	beforeEach(async () => {
		handleChallengeNameSpy = jest
			.spyOn(signInHelpers, 'handleChallengeName')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});

	afterEach(() => {
		handleChallengeNameSpy.mockClear();
	});

	test(`confirmSignIn should return a SignInResult when sign-in step is
		  ${AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_CODE} `, async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SMS_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				})
			);

		const signInResult = await signIn({ username, password });

		const smsCode = '123456';
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: smsCode,
		});
		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_CODE,
				codeDeliveryDetails: {
					deliveryMedium: 'SMS',
					destination: '*******9878',
				},
			},
		});
		expect(confirmSignInResult).toEqual({
			isSignedIn: true,
			nextStep: {
				signInStep: AuthSignInStep.DONE,
			},
		});

		expect(handleChallengeNameSpy).toBeCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
		handleUserSRPAuthflowSpy.mockClear();
	});

	test(`confirmSignIn should return a SignInResult when sign-in step is
		 ${AuthSignInStep.CONFIRM_SIGN_IN_WITH_TOTP_CODE} `, async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SOFTWARE_TOKEN_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {},
				})
			);

		const signInResult = await signIn({ username, password });

		const totpCode = '123456';
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: totpCode,
		});
		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_TOTP_CODE,
			},
		});
		expect(confirmSignInResult).toEqual({
			isSignedIn: true,
			nextStep: {
				signInStep: AuthSignInStep.DONE,
			},
		});

		expect(handleChallengeNameSpy).toBeCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
		handleUserSRPAuthflowSpy.mockClear();
	});

	test(`confirmSignIn should return a SignInResult when sign-in step is
		 ${AuthSignInStep.CONTINUE_SIGN_IN_WITH_MFA_SELECTION} `, async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SELECT_MFA_TYPE',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA"]',
					},
				})
			);
		// overrides handleChallengeNameSpy
		handleChallengeNameSpy.mockImplementation(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'SMS_MFA',
				$metadata: {},
				Session: '123123dasfas',
				ChallengeParameters: {
					CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
					CODE_DELIVERY_DESTINATION: '*******9878',
				},
			})
		);

		const signInResult = await signIn({ username, password });

		const mfaType = 'SMS';

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: mfaType,
		});

		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: AuthSignInStep.CONTINUE_SIGN_IN_WITH_MFA_SELECTION,
				allowedMFATypes: ['SMS', 'TOTP'],
			},
		});

		expect(confirmSignInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_CODE,
				codeDeliveryDetails: {
					deliveryMedium: 'SMS',
					destination: '*******9878',
				},
			},
		});

		expect(handleChallengeNameSpy).toBeCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);

		handleUserSRPAuthflowSpy.mockClear();
	});

	test('handleChallengeName should be called with clientMetada from request', async () => {
		const activeSignInSession = '1234234232';
		const activeChallengeName = 'SMS_MFA';
		const handleUserSRPAuthFlowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SMS_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				})
			);
		await signIn({ username, password });

		const challengeResponse = '123456';
		await confirmSignIn({
			challengeResponse,
			options: {
				serviceOptions: authAPITestParams.configWithClientMetadata,
			},
		});
		expect(handleChallengeNameSpy).toBeCalledWith(
			username,
			activeChallengeName,
			activeSignInSession,
			challengeResponse,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authAPITestParams.configWithClientMetadata
		);
		handleUserSRPAuthFlowSpy.mockClear();
	});

	test('handleChallengeName should be called with clientMetada from config', async () => {
		const activeSignInSession = '1234234232';
		const activeChallengeName = 'SMS_MFA';
		const handleUserSRPAuthFlowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SMS_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				})
			);
		await signIn({ username, password });

		Amplify.configure(authAPITestParams.configWithClientMetadata);
		const challengeResponse = '123456';
		await confirmSignIn({
			challengeResponse,
		});
		expect(handleChallengeNameSpy).toBeCalledWith(
			username,
			activeChallengeName,
			activeSignInSession,
			challengeResponse,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			undefined
		);
		handleUserSRPAuthFlowSpy.mockClear();
	});
});
