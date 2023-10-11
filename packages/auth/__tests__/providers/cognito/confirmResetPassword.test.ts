// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmResetPassword } from '../../../src/providers/cognito';
import { ConfirmForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import * as confirmResetPasswordClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
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
				clientMetadata: { fooo: 'fooo' },
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
});

describe('ConfirmResetPassword API error path cases', () => {
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
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					ConfirmForgotPasswordException.InvalidParameterException
				)
			)
		);
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

describe('Cognito ASF', () => {
	let confirmForgotPasswordSpy;

	beforeEach(() => {
		// load Cognito ASF polyfill
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
		confirmForgotPasswordSpy = jest
			.spyOn(confirmResetPasswordClient, 'confirmForgotPassword')
			.mockImplementationOnce(async () => {
				return authAPITestParams.confirmResetPasswordHttpCallResult;
			});
	});

	afterEach(() => {
		confirmForgotPasswordSpy.mockClear();
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
	test('Check UserContextData is added', async () => {
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
				UserContextData: {
					EncodedData: 'abcd',
				},
			})
		);
	});
});
