// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn, getCurrentUser } from '../../../src/providers/cognito';
import { initiateAuth } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import { USER_ALREADY_AUTHENTICATED_EXCEPTION } from '../../../src/errors/constants';
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
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);

describe('signIn API error path cases:', () => {
	// assert mocks
	const mockInitiateAuth = initiateAuth as jest.Mock;
	const mockedGetCurrentUser = getCurrentUser as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	afterEach(() => {
		mockedGetCurrentUser.mockReset();
		mockInitiateAuth.mockClear();
	});

	it('should throw an error when a user is already signed-in', async () => {
		mockedGetCurrentUser.mockResolvedValue({
			username: 'username',
			userId: 'userId',
		});

		try {
			await signIn({ username: 'username', password: 'password' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(USER_ALREADY_AUTHENTICATED_EXCEPTION);
		}
		mockedGetCurrentUser.mockClear();
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await signIn({ username: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignInUsername);
		}
	});

	it('should throw an error when password is not empty and authFlow is CUSTOM_WITHOUT_SRP', async () => {
		expect.assertions(2);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					authFlowType: 'CUSTOM_WITHOUT_SRP',
				},
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.CustomAuthSignInPassword);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockInitiateAuth.mockImplementation(() => {
			throw getMockError(InitiateAuthException.InvalidParameterException);
		});
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InvalidParameterException);
		}
	});
});
