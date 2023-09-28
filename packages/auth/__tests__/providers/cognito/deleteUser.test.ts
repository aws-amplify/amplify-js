// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { deleteUser } from '../../../src/providers/cognito';
import * as cognitoApis from '../../../src/providers/cognito';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { DeleteUserException } from '../../../src/providers/cognito/types/errors';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure(
	{
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	},
	{
		Auth: {
			tokenProvider: TokenProvider.CognitoUserPoolsTokenProvider,
		},
	}
);

const mockedAccessToken =
	'test_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('deleteUser API happy path cases', () => {
	let fetchAuthSessionsSpy;
	let deleteUserClientSpy;
	let tokenOrchestratorSpy;
	beforeEach(() => {
		fetchAuthSessionsSpy = jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		deleteUserClientSpy = jest
			.spyOn(clients, 'deleteUser')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
		tokenOrchestratorSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearDeviceMetadata')
			.mockImplementation(async () => {});
	});

	afterEach(() => {
		fetchAuthSessionsSpy.mockClear();
		deleteUserClientSpy.mockClear();
	});

	it('Should delete user, signout and clear device tokens', async () => {
		const signOutApiSpy = jest
			.spyOn(cognitoApis, 'signOut')
			.mockImplementationOnce(async () => {
				return new Promise(resolve => resolve());
			});

		await deleteUser();

		// deleteUserClient
		expect(deleteUserClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
			})
		);
		expect(deleteUserClientSpy).toBeCalledTimes(1);

		// signout
		expect(signOutApiSpy).toBeCalledTimes(1);

		// clear device tokens
		expect(tokenOrchestratorSpy).toBeCalled();
	});
});

describe('deleteUser API error path cases', () => {
	test('Should raise service error', async () => {
		expect.assertions(2);
		jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(DeleteUserException.InvalidParameterException)
			)
		);
		try {
			await deleteUser();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(DeleteUserException.InvalidParameterException);
		}
	});
});
