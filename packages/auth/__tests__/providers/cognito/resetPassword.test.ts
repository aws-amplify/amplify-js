// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString, Amplify } from '@aws-amplify/core';
import { ForgotPasswordCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { resetPassword } from '../../../src/providers/cognito';
import { ForgotPasswordException } from '../../../src/providers/cognito/types/errors/service';
import * as resetPasswordClient from '../../../src/providers/cognito/utils/clients/ResetPasswordClient';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { ResetPasswordClientInput } from '../../../src/providers/cognito/utils/clients/types/inputs';

describe('ResetPassword API happy path cases', () => {
	let resetPasswordSpy;

	beforeEach(() => {
		resetPasswordSpy = jest
			.spyOn(resetPasswordClient, 'resetPasswordClient')
			.mockImplementationOnce(async (params: ResetPasswordClientInput) => {
				return {
					CodeDeliveryDetails: {
						AttributeName: 'email',
						DeliveryMedium: 'EMAIL',
						Destination: 'test@email.com',
					},
				} as ForgotPasswordCommandOutput;
			});
	});

	afterEach(() => {
		resetPasswordSpy.mockClear();
	});

	test('ResetPassword API should call the UserPoolClient and should return a ResetPasswordResult', async () => {
		const result = await resetPassword({ username: 'username' });
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
		Amplify.configure(authAPITestParams.configWithClientMetadata);
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
			const result = await resetPassword({ username: 'username' });
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
				await resetPassword({ username: 'username' });
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
			await resetPassword({ username: 'username' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});
