// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { deleteUser } from '../../../src/providers/cognito';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { deleteUser as providerDeleteUser } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { DeleteUserException } from '../../../src/providers/cognito/types/errors';
import { signOut } from '../../../src/providers/cognito/apis/signOut';
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
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../src/providers/cognito/tokenProvider');

describe('deleteUser', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockDeleteUser = providerDeleteUser as jest.Mock;
	const mockSignOut = signOut as jest.Mock;
	const mockClearDeviceMetadata =
		tokenOrchestrator.clearDeviceMetadata as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockDeleteUser.mockResolvedValue({ $metadata: {} });
	});

	afterEach(() => {
		mockDeleteUser.mockReset();
		mockClearDeviceMetadata.mockClear();
		mockFetchAuthSession.mockClear();
	});

	it('should delete user, sign out and clear device tokens', async () => {
		await deleteUser();

		expect(mockDeleteUser).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
			})
		);
		expect(mockDeleteUser).toHaveBeenCalledTimes(1);
		expect(mockClearDeviceMetadata).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledTimes(1);

		// make sure we clearDeviceToken -> signout, in that order
		expect(mockClearDeviceMetadata.mock.invocationCallOrder[0]).toBeLessThan(
			mockSignOut.mock.invocationCallOrder[0]
		);
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
