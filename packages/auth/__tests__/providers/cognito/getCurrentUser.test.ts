// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { getCurrentUser } from '../../../src/providers/cognito';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import { AmplifyV6 as Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
		identityPoolId: 'us-west-2:xxxxxx',
	},
});
const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const mockedSub = 'mockedSub';
const mockedUsername = 'XXXXXXXXXXXXXX';
describe('getUser API happy path cases', () => {
	let fetchAuthSessionsSpy;
	beforeEach(() => {
		fetchAuthSessionsSpy = jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any; idToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
							idToken: {
								payload: {
									sub: mockedSub,
									'cognito:username': mockedUsername,
								},
							},
						},
					};
				}
			);
	});

	afterEach(() => {
		fetchAuthSessionsSpy.mockClear();
	});

	test('get current user', async () => {
		const result = await getCurrentUser();
		expect(result).toEqual({ username: mockedUsername, userId: mockedSub });
	});
});

describe('getUser API error path cases:', () => {
	test('getUser API should raise service error', async () => {
		expect.assertions(2);
		jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(async () => {
				throw new AuthError({
					name: InitiateAuthException.InternalErrorException,
					message: 'error at fetchAuthSession',
				});
			});
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(InitiateAuthException.InternalErrorException)
			)
		);
		try {
			await getCurrentUser({
				recache: true,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InternalErrorException);
		}
	});
});
