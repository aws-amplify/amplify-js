// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { updatePassword } from '../../../src/providers/cognito';
import { ChangePasswordException } from '../../../src/providers/cognito/types/errors';
import { createChangePasswordClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { getMockError, mockAccessToken } from './testUtils/data';
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

describe('updatePassword', () => {
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockChangePassword = jest.fn();
	const mockCreateChangePasswordClient = jest.mocked(
		createChangePasswordClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockChangePassword.mockResolvedValue({});
		mockCreateChangePasswordClient.mockReturnValueOnce(mockChangePassword);
	});

	afterEach(() => {
		mockChangePassword.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateChangePasswordClient.mockClear();
	});

	it('should call changePassword', async () => {
		await updatePassword({ oldPassword, newPassword });

		expect(mockChangePassword).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				PreviousPassword: oldPassword,
				ProposedPassword: newPassword,
			}),
		);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
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
		await updatePassword({ oldPassword, newPassword });

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when oldPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword: '', newPassword });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	it('should throw an error when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword, newPassword: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockChangePassword.mockImplementation(() => {
			throw getMockError(ChangePasswordException.InvalidParameterException);
		});

		try {
			await updatePassword({ oldPassword, newPassword });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ChangePasswordException.InvalidParameterException,
			);
		}
	});
});
