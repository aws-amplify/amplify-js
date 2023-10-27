// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import {
	signIn,
	getCurrentUser,
	CognitoUserPoolsTokenProvider,
} from '../../../src/providers/cognito';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import { Amplify } from 'aws-amplify';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { USER_ALREADY_AUTHENTICATED_EXCEPTION } from '../../../src/errors/constants';
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

Amplify.configure({
	Auth: authConfig,
});
CognitoUserPoolsTokenProvider.setAuthConfig(authConfig);

describe('signIn API error path cases:', () => {
	test('signIn API should throw a validation AuthError when a user is already signed-in', async () => {
		const mockedGetCurrentUser = getCurrentUser as jest.Mock;

		mockedGetCurrentUser.mockImplementationOnce(async () => {
			return {
				username: 'username',
				userId: 'userId',
			};
		});

		try {
			await signIn({ username: 'username', password: 'password' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(USER_ALREADY_AUTHENTICATED_EXCEPTION);
		}
		mockedGetCurrentUser.mockClear();
	});
	test('signIn API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await signIn({ username: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignInUsername);
		}
	});

	test('signIn API should raise service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(InitiateAuthException.InvalidParameterException)
			)
		);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InvalidParameterException);
		}
	});

	test('signIn API should throw a validation AuthError when password is not empty and when authFlow is CUSTOM_WITHOUT_SRP', async () => {
		expect.assertions(2);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					authFlowType: 'CUSTOM_WITHOUT_SRP',
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.CustomAuthSignInPassword);
		}
	});
});
