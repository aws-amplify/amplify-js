// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signUp } from '../../../src/providers/cognito';
import { AuthSignUpStep } from '../../../src/types';
import * as signUpClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { SignUpException } from '../../../src/providers/cognito/types/errors';
import { AmplifyErrorString, AmplifyV6 } from '@aws-amplify/core';
import { SignUpCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

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
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
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
				signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
				codeDeliveryDetails: {
					destination: user1.email,
					deliveryMedium: 'EMAIL',
					attributeName: 'email',
				},
			},
		});
		expect(signUpSpy).toHaveBeenCalledWith({
			ClientMetadata: undefined,
			Password: user1.password,
			UserAttributes: [{ Name: 'email', Value: user1.email }],
			Username: user1.username,
			ValidationData: undefined,
		});
		expect(signUpSpy).toBeCalledTimes(1);
	});
});

describe('SignUp API Error Path Cases:', () => {
	const { user1 } = authAPITestParams;
	const globalMock = global as any;

	test('SignUp API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await signUp({ username: '', password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpUsername);
		}
	});

	test('SignUp API should throw a validation AuthError when password is empty', async () => {
		expect.assertions(2);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await signUp({ username: user1.username, password: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignUpPassword);
		}
	});

	test('SignUp API should expect a service error', async () => {
		expect.assertions(2);
		const serviceError = new Error('service error');
		serviceError.name = SignUpException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await signUp({ username: user1.username, password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(SignUpException.InvalidParameterException);
		}
	});

	test('SignUp API should expect an unknown error when underlying error is not coming from the service', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await signUp({ username: user1.username, password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});

	test('SignUp API should expect an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await signUp({ username: user1.username, password: user1.password });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});

describe('SignUp API Edge Cases:', () => {});
