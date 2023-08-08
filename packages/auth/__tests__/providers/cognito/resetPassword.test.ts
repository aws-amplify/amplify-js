// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString, AmplifyV6 } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { resetPassword } from '../../../src/providers/cognito';
import { ForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import * as resetPasswordClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { ForgotPasswordCommandOutput } from 
'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

describe('ResetPassword API happy path cases', () => {
	let resetPasswordSpy;

	beforeEach(() => {
		resetPasswordSpy = jest
			.spyOn(resetPasswordClient, 'forgotPassword')
			.mockImplementationOnce(
				async () => {
					return authAPITestParams.resetPasswordHttpCallResult as ForgotPasswordCommandOutput;
				}
			);
	});

	afterEach(() => {
		resetPasswordSpy.mockClear();
	});

	test('ResetPassword API should call the UserPoolClient and should return a ResetPasswordResult', async () => {
		const result = await resetPassword(authAPITestParams.resetPasswordRequest);
		expect(result).toEqual(authAPITestParams.resetPasswordResult);
	});

	test('ResetPassword API input should contain clientMetadata from request', async () => {
		await resetPassword(
			authAPITestParams.resetPasswordRequestWithClientMetadata
		);
		expect(resetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(
				authAPITestParams.forgotPasswordCommandWithClientMetadata
			)
		);
	});

	test('ResetPassword API input should contain clientMetadata from config', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				...authAPITestParams.configWithClientMetadata,
			},
		});
		await resetPassword({ username: 'username' });
		expect(resetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(
				authAPITestParams.forgotPasswordCommandWithClientMetadata
			)
		);
	});
});

describe('ResetPassword API error path cases:', () => {
	const globalMock = global as any;

	test('ResetPassword API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await resetPassword({ username: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyResetPasswordUsername
			);
		}
	});

	test('ResetPassword API should raise service error', async () => {
		expect.assertions(3);
		const serviceError = new Error('service error');
		serviceError.name = ForgotPasswordException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await resetPassword(authAPITestParams.resetPasswordRequest);
		} catch (error) {
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ForgotPasswordException.InvalidParameterException
			);
		}
	});

	test(
		'ResetPassword API should raise an unknown error when underlying error is' +
			+'not coming from the service',
		async () => {
			expect.assertions(3);
			globalMock.fetch = jest.fn(() =>
				Promise.reject(new Error('unknown error'))
			);
			try {
				await resetPassword(authAPITestParams.resetPasswordRequest);
			} catch (error) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
				expect(error.underlyingError).toBeInstanceOf(Error);
			}
		}
	);

	test('ResetPassword API should raise an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await resetPassword(authAPITestParams.resetPasswordRequest);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});
