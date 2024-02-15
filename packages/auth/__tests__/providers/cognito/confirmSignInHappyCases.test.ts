// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { authAPITestParams } from './testUtils/authApiTestParams';
import {
	signIn,
	confirmSignIn,
	getCurrentUser,
} from '../../../src/providers/cognito/';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import {
	cognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

//  getCurrentUser is mocked so Hub is able to dispatch a mocked AuthUser
// before returning an `AuthSignInResult`
const mockedGetCurrentUser = getCurrentUser as jest.Mock;

describe('confirmSignIn API happy path cases', () => {
	let handleChallengeNameSpy;
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;

	beforeEach(async () => {
		cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);

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
				}),
			);
	});

	afterEach(() => {
		handleChallengeNameSpy.mockClear();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test(`confirmSignIn test SMS_MFA ChallengeName.`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});

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
				}),
			);

		const signInResult = await signIn({ username, password });

		const smsCode = '123456';

		mockedGetCurrentUser.mockImplementationOnce(async () => {
			return {
				username: 'username',
				userId: 'userId',
			};
		});
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: smsCode,
		});
		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_SMS_CODE',
				codeDeliveryDetails: {
					deliveryMedium: 'SMS',
					destination: '*******9878',
				},
			},
		});
		expect(confirmSignInResult).toEqual({
			isSignedIn: true,
			nextStep: {
				signInStep: 'DONE',
			},
		});

		expect(handleChallengeNameSpy).toHaveBeenCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		handleUserSRPAuthflowSpy.mockClear();
		mockedGetCurrentUser.mockClear();
	});

	test(`confirmSignIn tests MFA_SETUP challengeName`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SOFTWARE_TOKEN_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {},
				}),
			);

		const signInResult = await signIn({ username, password });

		const totpCode = '123456';
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: totpCode,
		});
		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
			},
		});
		expect(confirmSignInResult).toEqual({
			isSignedIn: true,
			nextStep: {
				signInStep: 'DONE',
			},
		});

		expect(handleChallengeNameSpy).toHaveBeenCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		handleUserSRPAuthflowSpy.mockClear();
	});

	test(`confirmSignIn tests SELECT_MFA_TYPE challengeName `, async () => {
		Amplify.configure({
			Auth: authConfig,
		});

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
				}),
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
			}),
		);

		const signInResult = await signIn({ username, password });

		const mfaType = 'SMS';

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: mfaType,
		});

		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
				allowedMFATypes: ['SMS', 'TOTP'],
			},
		});

		expect(confirmSignInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_SMS_CODE',
				codeDeliveryDetails: {
					deliveryMedium: 'SMS',
					destination: '*******9878',
				},
			},
		});

		expect(handleChallengeNameSpy).toHaveBeenCalledTimes(1);

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);

		handleUserSRPAuthflowSpy.mockClear();
	});

	test('handleChallengeName should be called with clientMetadata and  usersub', async () => {
		Amplify.configure({
			Auth: authConfig,
		});

		const mockedUserSub = '1111-2222-3333-4444';
		const activeSignInSession = '1234234232';
		const activeChallengeName = 'SMS_MFA';
		const initiateAuthSpy = jest
			.spyOn(clients, 'initiateAuth')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: activeChallengeName,
					Session: activeSignInSession,
					$metadata: {},
					ChallengeParameters: {
						USER_ID_FOR_SRP: mockedUserSub,
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				}),
			);
		await signIn({
			username,
			password,
			options: { authFlowType: 'USER_PASSWORD_AUTH' },
		});

		const challengeResponse = '123456';
		await confirmSignIn({
			challengeResponse,
			options: authAPITestParams.configWithClientMetadata,
		});
		const options = authAPITestParams.configWithClientMetadata;
		expect(handleChallengeNameSpy).toHaveBeenCalledWith(
			mockedUserSub,
			activeChallengeName,
			activeSignInSession,
			challengeResponse,
			authConfig.Cognito,
			tokenOrchestrator,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			options,
		);
		initiateAuthSpy.mockClear();
	});
});

describe('Cognito ASF', () => {
	let respondToAuthChallengeSpy;
	let handleUserSRPAuthFlowSpy;

	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
	beforeEach(() => {
		Amplify.configure({
			Auth: authConfig,
		});

		// load Cognito ASF polyfill
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};

		respondToAuthChallengeSpy = jest
			.spyOn(clients, 'respondToAuthChallenge')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> => {
					return {
						Session: '1234234232',
						$metadata: {},
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
					};
				},
			);
	});

	afterEach(() => {
		respondToAuthChallengeSpy.mockClear();
		handleUserSRPAuthFlowSpy.mockClear();
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('SMS_MFA challengeCheck UserContextData is added', async () => {
		handleUserSRPAuthFlowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SMS_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS_MFA',
						CODE_DELIVERY_DESTINATION: 'aaa@awsamplify.com',
					},
				}),
			);
		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe('CONFIRM_SIGN_IN_WITH_SMS_CODE');
		try {
			await confirmSignIn({
				challengeResponse: '777',
			});
		} catch (err) {
			console.log(err);
		}

		expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				ChallengeName: 'SMS_MFA',
				ChallengeResponses: { SMS_MFA_CODE: '777', USERNAME: 'user1' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				Session: '1234234232',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
	});

	test('SELECT_MFA_TYPE challengeCheck UserContextData is added', async () => {
		handleUserSRPAuthFlowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SELECT_MFA_TYPE',
					Session: '1234234232',
					ChallengeParameters: {
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA"]',
					},
					$metadata: {},
				}),
			);
		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
		);
		try {
			await confirmSignIn({
				challengeResponse: 'SMS',
			});
		} catch (err) {
			console.log(err);
		}

		expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				ChallengeName: 'SELECT_MFA_TYPE',
				ChallengeResponses: {
					ANSWER: 'SMS_MFA',
					USERNAME: 'user1',
				},
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				Session: '1234234232',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
	});

	test(`confirmSignIn tests MFA_SETUP sends UserContextData`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SOFTWARE_TOKEN_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {},
				}),
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe('CONFIRM_SIGN_IN_WITH_TOTP_CODE');
		try {
			await confirmSignIn({
				challengeResponse: '123456',
			});
		} catch (err) {
			console.log(err);
		}

		expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				ChallengeName: 'SOFTWARE_TOKEN_MFA',
				ChallengeResponses: {
					SOFTWARE_TOKEN_MFA_CODE: '123456',
					USERNAME: 'user1',
				},
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				Session: '1234234232',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
	});

	test(`confirmSignIn tests NEW_PASSWORD_REQUIRED sends UserContextData`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'NEW_PASSWORD_REQUIRED',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {},
				}),
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
		);
		try {
			await confirmSignIn({
				challengeResponse: 'password',
			});
		} catch (err) {
			console.log(err);
		}

		expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				ChallengeName: 'NEW_PASSWORD_REQUIRED',
				ChallengeResponses: {
					NEW_PASSWORD: 'password',
					USERNAME: 'user1',
				},
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				Session: '1234234232',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
	});
	test(`confirmSignIn tests CUSTOM_CHALLENGE sends UserContextData`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'CUSTOM_CHALLENGE',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {},
				}),
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
		);
		try {
			await confirmSignIn({
				challengeResponse: 'secret-answer',
			});
		} catch (err) {
			console.log(err);
		}

		expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				ChallengeName: 'CUSTOM_CHALLENGE',
				ChallengeResponses: {
					ANSWER: 'secret-answer',
					USERNAME: 'user1',
				},
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				Session: '1234234232',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
	});
});
