// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { getCurrentUser } from '../../../src/providers/cognito';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { Amplify as AmplifyV6 } from '@aws-amplify/core';
import { USER_UNAUTHENTICATED_EXCEPTION } from '../../../src/errors/constants';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
			identityPoolId: 'us-west-2:xxxxxx',
		},
	},
});
const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const mockGetTokensFunction = jest.spyOn(AmplifyV6.Auth, 'getTokens');
const mockedSub = 'mockedSub';
const mockedUsername = 'XXXXXXXXXXXXXX';

describe('getUser API happy path cases', () => {
	beforeEach(() => {
		mockGetTokensFunction.mockResolvedValue({
			accessToken: decodeJWT(mockedAccessToken),
			idToken: {
				payload: {
					sub: mockedSub,
					'cognito:username': mockedUsername,
				},
			},
		});
	});

	afterEach(() => {
		mockGetTokensFunction.mockClear();
	});

	test('get current user', async () => {
		const result = await getCurrentUser();
		expect(result).toEqual({ username: mockedUsername, userId: mockedSub });
	});
});

describe('getUser API error path cases:', () => {
	beforeEach(() => {
		mockGetTokensFunction.mockResolvedValue(null);
	});

	afterEach(() => {
		mockGetTokensFunction.mockClear();
	});
	test('getUser API should raise a validation error when tokens are not found', async () => {
		try {
			const result = await getCurrentUser();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(USER_UNAUTHENTICATED_EXCEPTION);
		}
	});
});
