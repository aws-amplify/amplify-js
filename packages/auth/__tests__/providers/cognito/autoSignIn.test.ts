// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';

import {
	cognitoUserPoolsTokenProvider,
	signUp,
} from '../../../src/providers/cognito';
import { autoSignIn } from '../../../src/providers/cognito/apis/autoSignIn';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthError } from '../../../src/errors/AuthError';
import { createSignUpClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
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
describe('Auto sign-in API Happy Path Cases:', () => {
	let handleUserSRPAuthFlowSpy: jest.SpyInstance;

	const mockSignUp = jest.fn();
	const mockCreateSignUpClient = jest.mocked(createSignUpClient);

	const { user1 } = authAPITestParams;
	beforeEach(async () => {
		mockSignUp.mockResolvedValueOnce({ UserConfirmed: true });
		mockCreateSignUpClient.mockReturnValueOnce(mockSignUp);

		handleUserSRPAuthFlowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput,
			);
	});

	afterEach(() => {
		mockSignUp.mockClear();
		mockCreateSignUpClient.mockClear();
		handleUserSRPAuthFlowSpy.mockClear();
	});

	test('signUp should enable autoSignIn and return COMPLETE_AUTO_SIGN_IN step', async () => {
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
		expect(mockSignUp).toHaveBeenCalledTimes(1);
	});

	test('Auto sign-in should resolve to a signIn output', async () => {
		const signInOutput = await autoSignIn();
		expect(signInOutput).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthFlowSpy).toHaveBeenCalledTimes(1);
	});
});

describe('Auto sign-in API Error Path Cases:', () => {
	test('autoSignIn should throw an error when autoSignIn is not enabled', async () => {
		try {
			await autoSignIn();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe('AutoSignInException');
		}
	});
});
