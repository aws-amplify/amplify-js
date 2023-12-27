// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { deleteUserAttributes } from '../../../src/providers/cognito';
import { DeleteUserAttributesException } from '../../../src/providers/cognito/types/errors';
import { deleteUserAttributes as providerDeleteUserAttributes } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('deleteUserAttributes', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockDeleteUserAttributes = providerDeleteUserAttributes as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockDeleteUserAttributes.mockResolvedValue({ $metadata: {} });
	});

	afterEach(() => {
		mockDeleteUserAttributes.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should delete user attributes', async () => {
		expect.assertions(2);
		await deleteUserAttributes({
			userAttributeKeys: ['given_name', 'address'],
		});
		expect(mockDeleteUserAttributes).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserAttributeNames: ['given_name', 'address'],
			})
		);
		expect(mockDeleteUserAttributes).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockDeleteUserAttributes.mockImplementation(() => {
			throw getMockError(
				DeleteUserAttributesException.InvalidParameterException
			);
		});
		try {
			await deleteUserAttributes({
				userAttributeKeys: ['address', 'given_name'],
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				DeleteUserAttributesException.InvalidParameterException
			);
		}
	});
});
