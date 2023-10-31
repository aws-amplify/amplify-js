// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoUserPoolsTokenProvider,
	confirmSignUp,
	signUp,
} from '../../../src/providers/cognito';
import {
	autoSignIn,
	resetAutoSignIn,
} from '../../../src/providers/cognito/apis/autoSignIn';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmSignUpException } from '../../../src/providers/cognito/types/errors';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};
CognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
});
describe('Auto sign-in API Happy Path Cases:', () => {
	let handleUserSRPAuthflowSpy;
	const { user1 } = authAPITestParams;
	beforeEach(async () => {
		handleUserSRPAuthflowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});
	afterEach(() => {
		handleUserSRPAuthflowSpy.mockClear();
	});
	test('signUp should enable autoSignIn and return COMPLETE_AUTO_SIGN_IN step', async () => {
		const signUpSpy = jest
			.spyOn(clients, 'signUp')
			.mockImplementationOnce(async () => {
				return {
					UserConfirmed: true,
				};
			});
		const resp = await signUp({
			username: user1.username,
			password: user1.password,
			options: {
				userAttributes: { email: user1.email },
				autoSignIn: true,
			},
		});
		expect(resp).toEqual({
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'COMPLETE_AUTO_SIGN_IN',
			},
		});
		expect(signUpSpy).toBeCalledTimes(1);
		signUpSpy.mockClear();
	});

	test('Auto sign-in should resolve to a signIn output', async () => {
		const signInOutput = await autoSignIn();
		expect(signInOutput).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
	});

	test('Auto sign-in should not resolve if a different user is confirmed', async () => {
		const user1 = 'user-1';
		const user2 = 'user-2';
		const signUpSpy = jest.spyOn(clients, 'signUp').mockReturnValue({
			UserConfirmed: false,
			UserSub: '1234567890',
			CodeDeliveryDetails: {
				AttributeName: 'email',
				DeliveryMedium: 'EMAIL',
				Destination: 'test1@test.com',
			},
		});
		const confirmSignUpSpy = jest
			.spyOn(clients, 'confirmSignUp')
			.mockReturnValueOnce({});

		// creates user 1
		const createUser1 = await signUp({
			username: user1,
			password: '********',
			options: {
				userAttributes: { email: 'email@email.com' },
				autoSignIn: true,
			},
		});

		// creates user 2
		const createUser2 = await signUp({
			username: user2,
			password: '********',
			options: {
				userAttributes: { email: 'email@email.com' },
				autoSignIn: true,
			},
		});

		// confirms user 1
		const outputFromUser1 = await confirmSignUp({
			username: user1,
			confirmationCode: '123456',
		});

		expect(outputFromUser1.nextStep.signUpStep).toEqual('DONE');

		signUpSpy.mockClear();
		confirmSignUpSpy.mockClear();
	});

	test('Auto sign-in should not be interrupted if confirmSignUp fails', async () => {
		const validCode = '123456';
		const invalidCode = '654321';
		const username = 'username';
		const signUpSpy = jest.spyOn(clients, 'signUp').mockReturnValueOnce({
			UserConfirmed: false,
			UserSub: '1234567890',
			CodeDeliveryDetails: {
				AttributeName: 'email',
				DeliveryMedium: 'EMAIL',
				Destination: 'test1@test.com',
			},
		});
		const confirmSignUpSpy = jest
			.spyOn(clients, 'confirmSignUp')
			.mockRejectedValueOnce(
				new AuthError({
					name: ConfirmSignUpException.CodeMismatchException,
					message: 'confirmSignUp failed',
				})
			)
			.mockResolvedValueOnce({});

		await signUp({
			username,
			password: '********',
			options: {
				userAttributes: { email: 'email@email.com' },
				autoSignIn: true,
			},
		});

		try {
			// first call to confirmSignUp should fail
			await confirmSignUp({ username, confirmationCode: invalidCode });
		} catch (error) {
			if (
				error instanceof AuthError &&
				error.name === ConfirmSignUpException.CodeMismatchException
			) {
				// second call to confirmSignUp should succeed
				const output = await confirmSignUp({
					username,
					confirmationCode: validCode,
				});
				expect(output.nextStep.signUpStep).toEqual('COMPLETE_AUTO_SIGN_IN');
				resetAutoSignIn();
			}
		}

		confirmSignUpSpy.mockClear();
		signUpSpy.mockClear();
	});

	test('sign up should return "COMPLETE_AUTO_SIGN_IN" step when autoSignIn is enabled with verification link ', async () => {
		Amplify.configure({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					signUpVerificationMethod: 'link',
				},
			},
		});

		const signUpSpy = jest.spyOn(clients, 'signUp').mockReturnValueOnce({
			UserConfirmed: false,
			UserSub: '1234567890',
			CodeDeliveryDetails: {
				AttributeName: 'email',
				DeliveryMedium: 'EMAIL',
				Destination: 'test1@test.com',
			},
		});

		const output = await signUp({
			username: 'username-1',
			password: '******',
			options: {
				userAttributes: { email: 'XXXXXXXXXXXXXXX' },
				autoSignIn: true,
			},
		});
		const step = output.nextStep.signUpStep;
		expect(step).toEqual('COMPLETE_AUTO_SIGN_IN');
		if (step === 'COMPLETE_AUTO_SIGN_IN') {
			expect(output.nextStep.codeDeliveryDetails?.deliveryMedium).toEqual(
				'EMAIL'
			);
		}

		resetAutoSignIn();
		signUpSpy.mockClear();
	});
});

describe('Auto sign-in API Error Path Cases:', () => {
	test('autoSignIn should throw an error when autoSignIn is not enabled', async () => {
		try {
			await autoSignIn();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe('AutoSignInException');
		}
	});
});
