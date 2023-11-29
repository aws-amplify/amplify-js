// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmResetPassword } from '../../../src/providers/cognito';
import { ConfirmForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import { confirmForgotPassword } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('confirmResetPassword', () => {
	// assert mocks
	const mockConfirmForgotPassword = confirmForgotPassword as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockConfirmForgotPassword.mockResolvedValue(
			authAPITestParams.confirmResetPasswordHttpCallResult
		);
	});

	afterEach(() => {
		mockConfirmForgotPassword.mockReset();
	});

	it('should call the confirmForgotPassword and return void', async () => {
		expect(
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest)
		).toBeUndefined();
		expect(mockConfirmForgotPassword).toHaveBeenCalled();
	});

	it('should contain clientMetadata from request', async () => {
		await confirmResetPassword({
			username: 'username',
			newPassword: 'password',
			confirmationCode: 'code',
			options: {
				clientMetadata: { fooo: 'fooo' },
			},
		});
		expect(mockConfirmForgotPassword).toHaveBeenCalledWith(
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

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: '',
				newPassword: 'password',
				confirmationCode: 'code',
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordUsername
			);
		}
	});

	it('should throw an error when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: 'username',
				newPassword: '',
				confirmationCode: 'code',
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword
			);
		}
	});

	it('should throw an error when confirmationCode is empty', async () => {
		expect.assertions(2);
		try {
			await confirmResetPassword({
				username: 'username',
				newPassword: 'password',
				confirmationCode: '',
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode
			);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockConfirmForgotPassword.mockImplementation(() => {
			throw getMockError(
				ConfirmForgotPasswordException.InvalidParameterException
			);
		});
		try {
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ConfirmForgotPasswordException.InvalidParameterException
			);
		}
	});

	it('should add UserContextData', async () => {
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};

		await confirmResetPassword({
			username: 'username',
			newPassword: 'password',
			confirmationCode: 'code',
			options: {
				clientMetadata: { fooo: 'fooo' },
			},
		});
		expect(mockConfirmForgotPassword).toHaveBeenCalledWith(
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
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
});
