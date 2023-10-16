// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signUp } from '../../../src/providers/cognito';
import * as signUpClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { SignUpException } from '../../../src/providers/cognito/types/errors';
import { SignUpCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
		},
	},
});
describe('SignUp API Happy Path Cases:', () => {
	let signUpSpy;
	const { user1 } = authAPITestParams;
	beforeEach(() => {
		signUpSpy = jest
			.spyOn(signUpClient, 'signUp')
			.mockImplementationOnce(async () => {
				return authAPITestParams.signUpHttpCallResult as SignUpCommandOutput;
			});
	});
	afterEach(() => {
		signUpSpy.mockClear();
	});
	test('SignUp API should call the UserPoolClient and should return a SignUpResult', async () => {
		const result = await signUp({
			username: user1.username,
			password: user1.password,
			options: {
				userAttributes: { email: user1.email },
			},
		});
		expect(result).toEqual({
			isSignUpComplete: false,
			nextStep: {
				signUpStep: 'CONFIRM_SIGN_UP',
				codeDeliveryDetails: {
					destination: user1.email,
					deliveryMedium: 'EMAIL',
					attributeName: 'email',
				},
			},
			userId: '1234567890',
		});
		expect(signUpSpy).toHaveBeenCalledWith(
			{ 
				region: 'us-west-2',
				userAgentValue: expect.any(String)
			},
			{
				ClientMetadata: undefined,
				Password: user1.password,
				UserAttributes: [{ Name: 'email', Value: user1.email }],
				Username: user1.username,
				ValidationData: undefined,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			}
		);
		expect(signUpSpy).toBeCalledTimes(1);
	});
});

describe('SignUp API Error Path Cases:', () => {
	const { user1 } = authAPITestParams;

	test('SignUp API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await signUp({ username: '', password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
		}
	});

	test('SignUp API should throw a validation AuthError when password is empty', async () => {
		expect.assertions(2);
		try {
			await signUp({ username: user1.username, password: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpPassword);
		}
	});

	test('SignUp API should expect a service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(SignUpException.InvalidParameterException)
			)
		);
		try {
			await signUp({ username: user1.username, password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(SignUpException.InvalidParameterException);
		}
	});
});

describe('SignUp API Edge Cases:', () => {});
