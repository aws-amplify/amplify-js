// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoUserPoolsTokenProvider,
	signUp,
} from '../../../src/providers/cognito';
import { autoSignIn } from '../../../src/providers/cognito/apis/autoSignIn';
import * as signUpClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthError } from '../../../src/errors/AuthError';
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
	let signUpSpy;
	let handleUserSRPAuthflowSpy;
	const { user1 } = authAPITestParams;
	beforeEach(async () => {
		signUpSpy = jest
			.spyOn(signUpClient, 'signUp')
			.mockImplementationOnce(async () => {
				return {
					UserConfirmed: true,
				};
			});

		handleUserSRPAuthflowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});
	afterEach(() => {
		signUpSpy.mockClear();
		handleUserSRPAuthflowSpy.mockClear();
	});
	test('signUp should enable autoSignIn and return COMPLETE_AUTO_SIGN_IN step', async () => {
		const resp = await signUp({
			username: user1.username,
			password: user1.password,
			options: {
				userAttributes: { email: user1.email },
				serviceOptions: {
					autoSignIn: true,
				},
			},
		});
		expect(resp).toEqual({
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'COMPLETE_AUTO_SIGN_IN',
			},
		});
		expect(signUpSpy).toBeCalledTimes(1);
	});

	test('Auto sign-in should resolve to a signIn output', async () => {
		const signInOutput = await autoSignIn();
		expect(signInOutput).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
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
