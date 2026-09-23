// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { AuthError } from '../../../src/errors/AuthError';
import { getCurrentUser } from '../../../src/providers/cognito';
import { USER_UNAUTHENTICATED_EXCEPTION } from '../../../src/errors/constants';

import { mockAccessToken } from './testUtils/data';

describe('getCurrentUser', () => {
	const mockedSub = 'mockedSub';
	const mockedUsername = 'XXXXXXXXXXXXXX';

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeEach(() => {
		mockCtx.getTokens.mockResolvedValue({
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
		mockCtx.getTokens.mockReset();
	});

	it('should get current user', async () => {
		const result = await getCurrentUser(mockCtx);
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
		mockCtx.getTokens.mockResolvedValue(undefined);
		try {
			await getCurrentUser(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(USER_UNAUTHENTICATED_EXCEPTION);
		}
	});
});
