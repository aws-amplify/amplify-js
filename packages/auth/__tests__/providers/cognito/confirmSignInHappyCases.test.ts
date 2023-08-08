// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthSignInStep } from '../../../src/types';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

AmplifyV6.configure({
	Auth: {
		userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
});

describe('confirmSignIn API happy path cases', () => {
	let handleChallengeNameSpy;
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
	beforeEach(async () => {
		handleChallengeNameSpy = jest
			.spyOn(signInHelpers, 'handleChallengeName')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: undefined,
					ChallengeParameters: {},
					AuthenticationResult: {
						AccessToken:
							'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
						ExpiresIn: 1000,
						IdToken:
							'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
						RefreshToken: 'qwersfsafsfssfasf',
					},
					Session: 'aaabbbcccddd',
					$metadata: {},
				})
			);
	});

	afterEach(() => {
		handleChallengeNameSpy.mockClear();
	});

	test(`confirmSignIn test SMS_MFA ChallengeName.`, async () => {
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

	test(`confirmSignIn tests MFA_SETUP challengeName`, async () => {
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

	test(`confirmSignIn tests SELECT_MFA_TYPE challengeName `, async () => {
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

	test('handleChallengeName should be called with clientMetadata from request', async () => {
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

	test('handleChallengeName should be called with clientMetadata from config', async () => {
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

		AmplifyV6.configure({
			Auth: {
				...authAPITestParams.configWithClientMetadata,
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
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
