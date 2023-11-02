// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { deleteUser } from '../../../src/providers/cognito';
import * as cognitoApis from '../../../src/providers/cognito';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { DeleteUserException } from '../../../src/providers/cognito/types/errors';
import { signOut } from '../../../src/providers/cognito/apis/signOut';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');
jest.mock('../../../src/providers/cognito/apis/signOut');
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	fetchAuthSession: jest.fn(),
	Amplify: {
		configure: jest.fn(),
		getConfig: jest.fn(() => ({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
				},
			},
		})),
	},
}));

const mockedAccessToken =
	'test_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockSignOut = signOut as jest.Mock;

describe('deleteUser API happy path cases', () => {
	let deleteUserClientSpy;
	let tokenOrchestratorSpy;
	beforeEach(() => {
		mockFetchAuthSession.mockImplementationOnce(
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
		mockFetchAuthSession.mockClear();
		deleteUserClientSpy.mockClear();
	});

	it('Should delete user, signout and clear device tokens', async () => {
		mockSignOut.mockImplementationOnce(async () => {
			return new Promise(resolve => resolve(void 0));
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
		expect(tokenOrchestratorSpy).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledTimes(1);

		// make sure we clearDeviceToken -> signout, in that order
		expect(tokenOrchestratorSpy.mock.invocationCallOrder[0]).toBeLessThan(
			mockSignOut.mock.invocationCallOrder[0]
		);
	});
});

describe('deleteUser API error path cases', () => {
	test('Should raise service error', async () => {
		expect.assertions(2);
		mockFetchAuthSession.mockImplementationOnce(
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
