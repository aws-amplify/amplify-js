// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	confirmSignIn,
	getCurrentUser,
	signIn,
} from '../../../src/providers/cognito/';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import {
	cognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';
import {
	createAssociateSoftwareTokenClient,
	createInitiateAuthClient,
	createRespondToAuthChallengeClient,
	createVerifySoftwareTokenClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/apis/getCurrentUser');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

//  getCurrentUser is mocked so Hub is able to dispatch a mocked AuthUser
// before returning an `AuthSignInResult`
const mockedGetCurrentUser = jest.mocked(getCurrentUser);

describe('confirmSignIn API happy path cases', () => {
	let handleChallengeNameSpy: jest.SpyInstance;
	const { username, password } = authAPITestParams.user1;

	const mockInitiateAuth = jest.fn();
	const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);

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

		mockCreateInitiateAuthClient.mockReturnValueOnce(mockInitiateAuth);
	});

	afterEach(() => {
		handleChallengeNameSpy.mockClear();
		mockInitiateAuth.mockClear();
		mockCreateInitiateAuthClient.mockClear();
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

	test(`confirmSignIn with EMAIL_OTP ChallengeName`, async () => {
		Amplify.configure({
			Auth: authConfig,
		});

		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
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

		const signInResult = await signIn({ username, password });

		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
				codeDeliveryDetails: {
					deliveryMedium: 'EMAIL',
					destination: 'j***@a***',
				},
			},
		});

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: '123456',
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

	test(`confirmSignIn with SELECT_MFA_TYPE challengeName and SMS response`, async () => {
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
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
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
				allowedMFATypes: ['SMS', 'TOTP', 'EMAIL'],
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

	test(`confirmSignIn with SELECT_MFA_TYPE challengeName and TOTP response`, async () => {
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
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
					},
				}),
			);

		handleChallengeNameSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'SOFTWARE_TOKEN_MFA',
				$metadata: {},
				Session: '123456789',
				ChallengeParameters: {},
			}),
		);

		const signInResult = await signIn({ username, password });

		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
				allowedMFATypes: ['SMS', 'TOTP', 'EMAIL'],
			},
		});

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: 'TOTP',
		});

		expect(confirmSignInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
			},
		});

		expect(handleChallengeNameSpy).toHaveBeenCalledTimes(1);
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);

		handleUserSRPAuthflowSpy.mockClear();
	});

	test(`confirmSignIn with SELECT_MFA_TYPE challengeName and EMAIL response`, async () => {
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
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
					},
				}),
			);

		handleChallengeNameSpy.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> => ({
				ChallengeName: 'EMAIL_OTP',
				$metadata: {},
				Session: '1234234232',
				ChallengeParameters: {
					CODE_DELIVERY_DELIVERY_MEDIUM: 'EMAIL',
					CODE_DELIVERY_DESTINATION: 'j***@a***',
				},
			}),
		);

		const signInResult = await signIn({ username, password });

		expect(signInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
				allowedMFATypes: ['SMS', 'TOTP', 'EMAIL'],
			},
		});

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: 'EMAIL',
		});

		expect(confirmSignInResult).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
				codeDeliveryDetails: {
					deliveryMedium: 'EMAIL',
					destination: 'j***@a***',
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
		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeName: activeChallengeName,
			Session: activeSignInSession,
			$metadata: {},
			ChallengeParameters: {
				USER_ID_FOR_SRP: mockedUserSub,
				CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
				CODE_DELIVERY_DESTINATION: '*******9878',
			},
		});
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
	});
});

describe('Cognito ASF', () => {
	let handleUserSRPAuthFlowSpy: jest.SpyInstance;

	const mockRespondToAuthChallenge = jest.fn();
	const mockCreateRespondToAuthChallengeClient = jest.mocked(
		createRespondToAuthChallengeClient,
	);

	const { username } = authAPITestParams.user1;
	const { password } = authAPITestParams.user1;
	beforeEach(() => {
		Amplify.configure({
			Auth: authConfig,
		});

		// load Cognito ASF polyfill
		(window as any).AmazonCognitoAdvancedSecurityData = {
			getData() {
				return 'abcd';
			},
		};

		mockRespondToAuthChallenge.mockResolvedValueOnce({
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
		});
		mockCreateRespondToAuthChallengeClient.mockReturnValueOnce(
			mockRespondToAuthChallenge,
		);
	});

	afterEach(() => {
		mockRespondToAuthChallenge.mockClear();
		mockCreateRespondToAuthChallengeClient.mockClear();
		handleUserSRPAuthFlowSpy.mockClear();
		(window as any).AmazonCognitoAdvancedSecurityData = undefined;
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
		await confirmSignIn({
			challengeResponse: '777',
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
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
		await confirmSignIn({
			challengeResponse: 'SMS',
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
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
		jest.spyOn(signInHelpers, 'handleUserSRPAuthFlow').mockImplementationOnce(
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
		await confirmSignIn({
			challengeResponse: '123456',
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
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
		jest.spyOn(signInHelpers, 'handleUserSRPAuthFlow').mockImplementationOnce(
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
		await confirmSignIn({
			challengeResponse: 'password',
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
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
		jest.spyOn(signInHelpers, 'handleUserSRPAuthFlow').mockImplementationOnce(
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
		await confirmSignIn({
			challengeResponse: 'secret-answer',
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
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

describe('confirmSignIn MFA_SETUP challenge happy path cases', () => {
	const { username, password } = authAPITestParams.user1;

	test('confirmSignIn with multiple MFA_SETUP options using SOFTWARE_TOKEN_MFA', async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeMultipleMfaSetupOutput,
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION',
		);

		const mockAssociateSoftwareToken = jest.fn();

		jest
			.mocked(createAssociateSoftwareTokenClient)
			.mockReturnValue(mockAssociateSoftwareToken);

		mockAssociateSoftwareToken.mockResolvedValueOnce({
			SecretCode: 'secret-code',
			Session: '12341234',
			$metadata: {},
		});

		const selectMfaToSetupConfirmSignInResult = await confirmSignIn({
			challengeResponse: 'TOTP',
		});

		expect(selectMfaToSetupConfirmSignInResult.isSignedIn).toBe(false);
		expect(selectMfaToSetupConfirmSignInResult.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_TOTP_SETUP',
		);

		const mockVerifySoftwareToken = jest.fn();

		jest
			.mocked(createVerifySoftwareTokenClient)
			.mockReturnValue(mockVerifySoftwareToken);

		mockVerifySoftwareToken.mockResolvedValue({
			Session: '12341234',
			Status: 'SUCCESS',
			$metadata: {},
		});

		const mockRespondToAuthChallenge = jest.fn();

		jest
			.mocked(createRespondToAuthChallengeClient)
			.mockReturnValue(mockRespondToAuthChallenge);

		mockRespondToAuthChallenge.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

		const totpCode = '123456';
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: totpCode,
		});

		expect(mockVerifySoftwareToken).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				UserCode: totpCode,
				Session: '12341234',
			}),
		);
		expect(confirmSignInResult.isSignedIn).toBe(true);
		expect(confirmSignInResult.nextStep.signInStep).toBe('DONE');
	});

	test('confirmSignIn with multiple MFA_SETUP options using EMAIL_OTP', async () => {
		Amplify.configure({
			Auth: authConfig,
		});

		jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeMultipleMfaSetupOutput,
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION',
		);

		const selectMfaToSetupConfirmSignInResult = await confirmSignIn({
			challengeResponse: 'EMAIL',
		});

		expect(selectMfaToSetupConfirmSignInResult.isSignedIn).toBe(false);
		expect(selectMfaToSetupConfirmSignInResult.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_EMAIL_SETUP',
		);

		jest.spyOn(signInHelpers, 'handleChallengeName').mockImplementationOnce(
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

		const setupEmailConfirmSignInResult = await confirmSignIn({
			challengeResponse: 'j***@a***',
		});

		expect(setupEmailConfirmSignInResult.nextStep.signInStep).toBe(
			'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
		);

		const mockRespondToAuthChallenge = jest.fn();

		jest
			.mocked(createRespondToAuthChallengeClient)
			.mockReturnValue(mockRespondToAuthChallenge);

		mockRespondToAuthChallenge.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: '123456',
		});

		expect(confirmSignInResult.isSignedIn).toBe(true);
		expect(confirmSignInResult.nextStep.signInStep).toBe('DONE');
	});

	test('confirmSignIn with single MFA_SETUP option using EMAIL_OTP', async () => {
		Amplify.configure({
			Auth: authConfig,
		});

		jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeEmailMfaSetupOutput,
			);

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_EMAIL_SETUP',
		);

		jest.spyOn(signInHelpers, 'handleChallengeName').mockImplementationOnce(
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

		const setupEmailConfirmSignInResult = await confirmSignIn({
			challengeResponse: 'j***@a***',
		});

		expect(setupEmailConfirmSignInResult.nextStep.signInStep).toBe(
			'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
		);

		jest
			.spyOn(signInHelpers, 'handleChallengeName')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput,
			);

		const confirmSignInResult = await confirmSignIn({
			challengeResponse: '123456',
		});

		expect(confirmSignInResult.isSignedIn).toBe(true);
		expect(confirmSignInResult.nextStep.signInStep).toBe('DONE');
	});

	test('confirmSignIn with single MFA_SETUP option using SOFTWARE_TOKEN_MFA', async () => {
		Amplify.configure({
			Auth: authConfig,
		});
		jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeTotpMfaSetupOutput,
			);

		const mockAssociateSoftwareToken = jest.fn();
		jest
			.mocked(createAssociateSoftwareTokenClient)
			.mockReturnValue(mockAssociateSoftwareToken);

		mockAssociateSoftwareToken.mockResolvedValueOnce({
			SecretCode: 'secret-code',
			Session: '12341234',
			$metadata: {},
		});

		const result = await signIn({ username, password });

		expect(result.isSignedIn).toBe(false);
		expect(result.nextStep.signInStep).toBe('CONTINUE_SIGN_IN_WITH_TOTP_SETUP');

		const mockVerifySoftwareToken = jest.fn();
		jest
			.mocked(createVerifySoftwareTokenClient)
			.mockReturnValue(mockVerifySoftwareToken);

		mockVerifySoftwareToken.mockResolvedValueOnce({
			Session: '12341234',
			Status: 'SUCCESS',
			$metadata: {},
		});

		const mockRespondToAuthChallenge = jest.fn();

		jest
			.mocked(createRespondToAuthChallengeClient)
			.mockReturnValue(mockRespondToAuthChallenge);

		mockRespondToAuthChallenge.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

		const totpCode = '123456';
		const confirmSignInResult = await confirmSignIn({
			challengeResponse: totpCode,
		});

		expect(mockVerifySoftwareToken).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				UserCode: totpCode,
				Session: '12341234',
			}),
		);
		expect(confirmSignInResult.isSignedIn).toBe(true);
		expect(confirmSignInResult.nextStep.signInStep).toBe('DONE');
	});
});
