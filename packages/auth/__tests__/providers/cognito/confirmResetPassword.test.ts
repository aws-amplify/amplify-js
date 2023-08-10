// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmResetPassword } from '../../../src/providers/cognito';
import { ConfirmForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import * as confirmResetPasswordClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';

AmplifyV6.configure({
	Auth: {
		userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
});
describe('ConfirmResetPassword API happy path cases', () => {
	let confirmForgotPasswordSpy;

	beforeEach(() => {
		confirmForgotPasswordSpy = jest
			.spyOn(confirmResetPasswordClient, 'confirmForgotPassword')
			.mockImplementationOnce(async () => {
				return authAPITestParams.confirmResetPasswordHttpCallResult;
			});
	});

	afterEach(() => {
		confirmForgotPasswordSpy.mockClear();
	});

	test('ConfirmResetPassword API should call the UserPoolClient and return void', async () => {
		expect(
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest)
		).toBeUndefined();
		expect(confirmForgotPasswordSpy).toBeCalled();
	});

	test('ConfirmResetPassword API input should contain clientMetadata from request', async () => {
		await confirmResetPassword({
			username: 'username',
			newPassword: 'password',
			confirmationCode: 'code',
			options: {
				serviceOptions: {
					clientMetadata: { fooo: 'fooo' },
				},
			},
		});
		expect(confirmForgotPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				Username: 'username',
				ConfirmationCode: 'code',
				Password: 'password',
				ClientMetadata: { fooo: 'fooo' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			})
		);
	});

	test('ConfirmResetPassword API input should contain clientMetadata from config', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				clientMetadata:{foo:'bar'}
			},
		});
		await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		expect(confirmForgotPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
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
		jest
			.spyOn(confirmResetPasswordClient, 'confirmForgotPassword')
			.mockImplementationOnce(async () => {
				throw new AuthError({
					name: ConfirmForgotPasswordException.InvalidParameterException,
					message: 'confirm forgot execption',
				});
			});

		expect.assertions(2);

		try {
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ConfirmForgotPasswordException.InvalidParameterException
			);
		}
	});
});
