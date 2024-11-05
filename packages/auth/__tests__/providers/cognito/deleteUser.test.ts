// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { deleteUser } from '../../../src/providers/cognito';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { DeleteUserException } from '../../../src/providers/cognito/types/errors';
import { signOut } from '../../../src/providers/cognito/apis/signOut';
import { createDeleteUserClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
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
jest.mock('../../../src/providers/cognito/apis/signOut');
jest.mock('../../../src/providers/cognito/tokenProvider');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('deleteUser', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockDeleteUser = jest.fn();
	const mockCreateDeleteUserClient = jest.mocked(createDeleteUserClient);
	const mockSignOut = signOut as jest.Mock;
	const mockClearDeviceMetadata =
		tokenOrchestrator.clearDeviceMetadata as jest.Mock;
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
		mockDeleteUser.mockResolvedValue({ $metadata: {} });
		mockCreateDeleteUserClient.mockReturnValueOnce(mockDeleteUser);
	});

	afterEach(() => {
		mockDeleteUser.mockReset();
		mockClearDeviceMetadata.mockClear();
		mockFetchAuthSession.mockClear();
		mockCreateDeleteUserClient.mockClear();
	});

	it('should delete user, sign out and clear device tokens', async () => {
		await deleteUser();

		expect(mockDeleteUser).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
			}),
		);
		expect(mockDeleteUser).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledTimes(1);

		// make sure we clearDeviceToken -> signout, in that order
		expect(mockClearDeviceMetadata.mock.invocationCallOrder[0]).toBeLessThan(
			mockSignOut.mock.invocationCallOrder[0],
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
		await deleteUser();

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockDeleteUser.mockImplementation(() => {
			throw getMockError(DeleteUserException.InvalidParameterException);
		});
		try {
			await deleteUser();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(DeleteUserException.InvalidParameterException);
		}
	});
});
