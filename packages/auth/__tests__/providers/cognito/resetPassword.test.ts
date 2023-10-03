// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { resetPassword } from '../../../src/providers/cognito';
import { ForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import * as resetPasswordClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { ForgotPasswordCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
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
describe('ResetPassword API happy path cases', () => {
	let resetPasswordSpy;

	beforeEach(() => {
		resetPasswordSpy = jest
			.spyOn(resetPasswordClient, 'forgotPassword')
			.mockImplementationOnce(async () => {
				return authAPITestParams.resetPasswordHttpCallResult as ForgotPasswordCommandOutput;
			});
	});

	afterEach(() => {
		resetPasswordSpy.mockClear();
	});

	test('ResetPassword API should call the UserPoolClient and should return a ResetPasswordResult', async () => {
		const result = await resetPassword(authAPITestParams.resetPasswordRequest);
		expect(result).toEqual(authAPITestParams.resetPasswordResult);
	});

	test('ResetPassword API input should contain clientMetadata from request', async () => {
		await resetPassword({
			username: 'username',
			options: {
				serviceOptions: {
					clientMetadata: { foo: 'foo' },
				},
			},
		});
		expect(resetPasswordSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				Username: 'username',
				ClientMetadata: { foo: 'foo' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			})
		);
	});
});

describe('ResetPassword API error path cases:', () => {
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
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					ForgotPasswordException.InvalidParameterException
				)
			)
		);
		try {
			await resetPassword(authAPITestParams.resetPasswordRequest);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ForgotPasswordException.InvalidParameterException
			);
		}
	});
});
