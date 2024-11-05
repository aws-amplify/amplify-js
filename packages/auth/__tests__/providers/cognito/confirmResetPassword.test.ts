// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmResetPassword } from '../../../src/providers/cognito';
import { ConfirmForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import { createConfirmForgotPasswordClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('confirmResetPassword', () => {
	// assert mocks
	const mockConfirmForgotPassword = jest.fn();
	const mockCreateConfirmResetPasswordClient = jest.mocked(
		createConfirmForgotPasswordClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockConfirmForgotPassword.mockResolvedValue(
			authAPITestParams.confirmResetPasswordHttpCallResult,
		);
		mockCreateConfirmResetPasswordClient.mockReturnValueOnce(
			mockConfirmForgotPassword,
		);
	});

	afterEach(() => {
		mockConfirmForgotPassword.mockReset();
		mockCreateConfirmResetPasswordClient.mockClear();
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
	});

	it('should call the confirmForgotPassword and return void', async () => {
		await expect(
			confirmResetPassword(authAPITestParams.confirmResetPasswordRequest),
		).resolves.toBeUndefined();
		expect(mockConfirmForgotPassword).toHaveBeenCalled();
	});

	it('invokes createCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		jest.mocked(Amplify.getConfig).mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});

		await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
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
			}),
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
				AuthValidationErrorCode.EmptyConfirmResetPasswordUsername,
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
				AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword,
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
				AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode,
			);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockConfirmForgotPassword.mockImplementation(() => {
			throw getMockError(
				ConfirmForgotPasswordException.InvalidParameterException,
			);
		});
		try {
			await confirmResetPassword(authAPITestParams.confirmResetPasswordRequest);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ConfirmForgotPasswordException.InvalidParameterException,
			);
		}
	});

	it('should add UserContextData', async () => {
		(window as any).AmazonCognitoAdvancedSecurityData = {
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
			}),
		);
		(window as any).AmazonCognitoAdvancedSecurityData = undefined;
	});
});
