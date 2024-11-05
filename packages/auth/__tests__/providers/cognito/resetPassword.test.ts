// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { resetPassword } from '../../../src/providers/cognito';
import { ForgotPasswordException } from '../../../src/providers/cognito/types/errors';
import { createForgotPasswordClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
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

describe('resetPassword', () => {
	// assert mocks
	const mockForgotPassword = jest.fn();
	const mockCreateForgotPasswordClient = jest.mocked(
		createForgotPasswordClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockForgotPassword.mockResolvedValue(
			authAPITestParams.resetPasswordHttpCallResult,
		);
		mockCreateForgotPasswordClient.mockReturnValueOnce(mockForgotPassword);
	});

	afterEach(() => {
		mockForgotPassword.mockReset();
		mockCreateForgotPasswordClient.mockClear();
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
	});

	it('should call forgotPassword and return a result', async () => {
		const result = await resetPassword(authAPITestParams.resetPasswordRequest);
		expect(result).toEqual(authAPITestParams.resetPasswordResult);
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

		await resetPassword(authAPITestParams.resetPasswordRequest);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should contain clientMetadata from request', async () => {
		await resetPassword({
			username: 'username',
			options: {
				clientMetadata: { foo: 'foo' },
			},
		});
		expect(mockForgotPassword).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				Username: 'username',
				ClientMetadata: { foo: 'foo' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			}),
		);
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await resetPassword({ username: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyResetPasswordUsername,
			);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockForgotPassword.mockImplementation(() => {
			throw getMockError(ForgotPasswordException.InvalidParameterException);
		});
		try {
			await resetPassword(authAPITestParams.resetPasswordRequest);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ForgotPasswordException.InvalidParameterException,
			);
		}
	});

	it('should send UserContextData', async () => {
		(window as any).AmazonCognitoAdvancedSecurityData = {
			getData() {
				return 'abcd';
			},
		};
		await resetPassword({
			username: 'username',
			options: {
				clientMetadata: { foo: 'foo' },
			},
		});
		expect(mockForgotPassword).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				Username: 'username',
				ClientMetadata: { foo: 'foo' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				UserContextData: { EncodedData: 'abcd' },
			}),
		);
		(window as any).AmazonCognitoAdvancedSecurityData = undefined;
	});
});
