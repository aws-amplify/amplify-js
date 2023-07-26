// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString, AmplifyV6 } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmResetPassword } from '../../../src/providers/cognito';
import { ConfirmForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import * as confirmResetPasswordClient from '../../../src/providers/cognito/utils/clients/ConfirmResetPasswordClient';
import { authAPITestParams } from './testUtils/authApiTestParams';

describe('ConfirmResetPassword API happy path cases', () => {
	let confirmResetPasswordSpy;

	beforeEach(() => {
		confirmResetPasswordSpy = jest
			.spyOn(confirmResetPasswordClient, 'confirmResetPasswordClient')
			.mockImplementationOnce(
				async (
					params: confirmResetPasswordClient.ConfirmResetPasswordClientInput
				) => {
					return authAPITestParams.confirmResetPasswordHttpCallResult;
				}
			);
	});

	afterEach(() => {
		confirmResetPasswordSpy.mockClear();
	});

	test('ConfirmResetPassword API should call the UserPoolClient and return void', async () => {
		expect(
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest)
		).toBeUndefined();
		expect(confirmResetPasswordSpy).toBeCalled();
	});

	test('ConfirmResetPassword API input should contain clientMetadata from request', async () => {
		await confirmResetPassword(
			authAPITestParams.confirmResetPasswordRequestWithClientMetadata
		);
		expect(confirmResetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(
				authAPITestParams.confirmForgotPasswordCommandWithClientMetadata
			)
		);
	});

	test('ConfirmResetPassword API input should contain clientMetadata from config', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				...authAPITestParams.configWithClientMetadata,
			},
		});
		await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		expect(confirmResetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining(
				authAPITestParams.confirmForgotPasswordCommandWithClientMetadata
			)
		);
	});
});

describe('ConfirmResetPassword API error path cases', () => {
	const globalMock = global as any;
	test('ConfirmResetPassword API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: '',
				newPassword: 'password',
				confirmationCode: 'code',
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordUsername
			);
		}
	});

	test('ConfirmResetPassword API should throw a validation AuthError when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: 'username',
				newPassword: '',
				confirmationCode: 'code',
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword
			);
		}
	});

	test('ConfirmResetPassword API should throw a validation AuthError when confirmationCode is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: 'username',
				newPassword: 'password',
				confirmationCode: '',
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode
			);
		}
	});

	test('ConfirmResetPassword API should raise service error', async () => {
		expect.assertions(3);
		const serviceError = new Error('service error');
		serviceError.name =
			ConfirmForgotPasswordException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		} catch (error) {
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ConfirmForgotPasswordException.InvalidParameterException
			);
		}
	});

	test(
		'ConfirmResetPassword API should raise an unknown error when underlying ' +
			+'error is not coming from the service',
		async () => {
			expect.assertions(3);
			globalMock.fetch = jest.fn(() =>
				Promise.reject(new Error('unknown error'))
			);
			try {
				await confirmResetPassword(
					authAPITestParams.confirmResetPasswordRequest
				);
			} catch (error) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
				expect(error.underlyingError).toBeInstanceOf(Error);
			}
		}
	);

	test('ConfirmResetPassword API should raise an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});
