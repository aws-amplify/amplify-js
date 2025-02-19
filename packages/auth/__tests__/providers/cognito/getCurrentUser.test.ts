// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { getCurrentUser } from '../../../src/providers/cognito';
import { USER_UNAUTHENTICATED_EXCEPTION } from '../../../src/errors/constants';

import { mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: {
		Auth: { getTokens: jest.fn() },
		getConfig: jest.fn(() => ({})),
		assertConfigured: jest.fn(),
	},
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

describe('getCurrentUser', () => {
	const mockedSub = 'mockedSub';
	const mockedUsername = 'XXXXXXXXXXXXXX';
	// assert mocks
	const mockGetTokensFunction = Amplify.Auth.getTokens as jest.Mock;
	const mockAssertConfigured = Amplify.assertConfigured as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockAssertConfigured.mockReturnValue(undefined);
		mockGetTokensFunction.mockResolvedValue({
			accessToken: decodeJWT(mockAccessToken),
			idToken: {
				payload: {
					sub: mockedSub,
					'cognito:username': mockedUsername,
				},
			},
			signInDetails: {
				loginId: mockedUsername,
				authFlowType: 'USER_SRP_AUTH',
			},
		});
	});

	afterEach(() => {
		mockGetTokensFunction.mockReset();
		mockAssertConfigured.mockReset();
	});

	it('should get current user', async () => {
		const result = await getCurrentUser();
		expect(result).toEqual({
			username: mockedUsername,
			userId: mockedSub,
			signInDetails: {
				loginId: mockedUsername,
				authFlowType: 'USER_SRP_AUTH',
			},
		});
	});

	it('should throw an error when tokens are not found', async () => {
		mockGetTokensFunction.mockResolvedValue(undefined);
		try {
			await getCurrentUser();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(USER_UNAUTHENTICATED_EXCEPTION);
		}
	});

	it('throws if Amplify is not configured', async () => {
		mockAssertConfigured.mockImplementationOnce(() => {
			throw new Error(
				'Amplify has not been configured. Please call Amplify.configure() before using this service.',
			);
		});

		expect(getCurrentUser()).rejects.toThrow(
			'Amplify has not been configured. Please call Amplify.configure() before using this service.',
		);
	});
});
