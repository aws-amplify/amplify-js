// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { signUp } from '../../../src/providers/cognito';
import { signUp as providerSignUp } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { SignUpException } from '../../../src/providers/cognito/types/errors';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';
import {
	signUp as signUpPasswordless,
	assertSignUpWithEmailOptions,
	assertSignUpWithSMSOptions,
} from '../../../src/providers/cognito/apis/passwordless';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../src/providers/cognito/apis/passwordless', () => ({
	...jest.requireActual('../../../src/providers/cognito/apis/passwordless'),
	signUp: jest.fn(),
	assertSignUpWithEmailOptions: jest.fn(),
	assertSignUpWithSMSOptions: jest.fn(),
}));

describe('signUp', () => {
	const { user1 } = authAPITestParams;
	// assert mocks
	const mockSignUp = providerSignUp as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockSignUp.mockResolvedValue(authAPITestParams.signUpHttpCallResult);
	});

	afterEach(() => {
		mockSignUp.mockReset();
	});

	it('should call signUp and return a result', async () => {
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
		expect(mockSignUp).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
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
		expect(mockSignUp).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await signUp({ username: '', password: user1.password });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
		}
	});

	it('should throw an error when password is empty', async () => {
		expect.assertions(2);
		try {
			await signUp({ username: user1.username, password: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpPassword);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockSignUp.mockImplementation(() => {
			throw getMockError(SignUpException.InvalidParameterException);
		});
		try {
			await signUp({ username: user1.username, password: user1.password });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(SignUpException.InvalidParameterException);
		}
	});

	describe('with passwordless options', () => {
		it('should call signUp passwordless if passwordless delivery medium is EMAIL and method is Magic Link', async () => {
			const input = {
				username: user1.username,
				passwordless: {
					deliveryMedium: 'EMAIL' as const,
					method: 'MAGIC_LINK' as const,
				},
				options: {
					userAttributes: { email: user1.email },
				},
			};
			await signUp(input);
			expect(assertSignUpWithEmailOptions).toHaveBeenCalledWith(input.options);
			expect(signUpPasswordless).toHaveBeenCalledWith(input);
		});

		it('should call signUp passwordless if passwordless delivery medium is SMS and method is OTP', async () => {
			const input = {
				username: user1.username,
				passwordless: {
					deliveryMedium: 'SMS' as const,
					method: 'OTP' as const,
				},
				options: {
					userAttributes: { phone_number: '123' },
				},
			};
			await signUp(input);
			expect(assertSignUpWithSMSOptions).toHaveBeenCalledWith(input.options);
			expect(signUpPasswordless).toHaveBeenCalledWith(input);
		});

		it('should call signUp passwordless if passwordless delivery medium is EMAIL and method is OTP', async () => {
			const input = {
				username: user1.username,
				passwordless: {
					deliveryMedium: 'EMAIL' as const,
					method: 'OTP' as const,
				},
				options: {
					userAttributes: { email: user1.email },
				},
			};
			await signUp(input);
			expect(assertSignUpWithEmailOptions).toHaveBeenCalledWith(input.options);
			expect(signUpPasswordless).toHaveBeenCalledWith(input);
		});

		it('should throw error if passwordless delivery medium is SMS and method is Magic Link', async () => {
			expect.assertions(2);
			const input = {
				username: user1.username,
				passwordless: {
					deliveryMedium: 'SMS' as const,
					method: 'MAGIC_LINK' as const,
				},
				options: {
					userAttributes: { phone_number: '123' },
				},
			};
			try {
				// @ts-expect-error testing invalid input
				await signUp(input);
			} catch (error: any) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(
					AuthValidationErrorCode.IncorrectPasswordlessMethod
				);
			}
		});
	});
});
