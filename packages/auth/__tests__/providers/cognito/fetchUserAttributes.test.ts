// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { decodeJWT, fetchAuthSession } from '@aws-amplify/core/internals/utils';
import { getUser } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../src/errors/AuthError';
import { GetUserException } from '../../../src/providers/cognito/types/errors';
import { fetchUserAttributes } from '../../../src/providers/cognito/apis/fetchUserAttributes';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	fetchAuthSession: jest.fn(),
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);

describe('fetchUserAttributes', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockGetUser = getUser as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockGetUser.mockResolvedValue({
			UserAttributes: [
				{ Name: 'email', Value: 'XXXXXXXXXXXXX' },
				{ Name: 'phone_number', Value: '000000000000000' },
			],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'SMS_MFA',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA'],
			$metadata: {},
		});
	});

	afterEach(() => {
		mockGetUser.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should return the current user attributes into a map format', async () => {
		expect(await fetchUserAttributes()).toEqual({
			email: 'XXXXXXXXXXXXX',
			phone_number: '000000000000000',
		});
		expect(mockGetUser).toHaveBeenCalledTimes(1);
		expect(mockGetUser).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockGetUser.mockImplementation(() => {
			throw getMockError(GetUserException.InvalidParameterException);
		});
		mockFetchAuthSession.mockResolvedValueOnce({
			tokens: {
				accessToken: decodeJWT(mockAccessToken),
			},
		});

		try {
			await fetchUserAttributes();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(GetUserException.InvalidParameterException);
		}
	});
});
