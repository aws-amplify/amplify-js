// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { updatePassword } from '../../../src/providers/cognito';
import { ChangePasswordException } from '../../../src/providers/cognito/types/errors';
import * as changePasswordClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { ChangePasswordCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

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
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
describe('updatePassword API happy path cases', () => {
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';

	let changePasswordClientSpy;
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
		changePasswordClientSpy = jest
			.spyOn(changePasswordClient, 'changePassword')
			.mockImplementationOnce(
				async (): Promise<ChangePasswordCommandOutput> => {
					return {} as ChangePasswordCommandOutput;
				}
			);
	});

	afterEach(() => {
		changePasswordClientSpy.mockClear();
		mockFetchAuthSession.mockClear();
	});

	test('updatePassword should call changePassword', async () => {
		await updatePassword({ oldPassword, newPassword });

		expect(changePasswordClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				PreviousPassword: oldPassword,
				ProposedPassword: newPassword,
			})
		);
	});
});

describe('updatePassword API error path cases:', () => {
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';

	test('updatePassword API should throw a validation AuthError when oldPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword: '', newPassword });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	test('updatePassword API should throw a validation AuthError when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword, newPassword: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	test('updatePassword API should raise service error', async () => {
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
				buildMockErrorResponse(
					ChangePasswordException.InvalidParameterException
				)
			)
		);
		try {
			await updatePassword({ oldPassword, newPassword });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ChangePasswordException.InvalidParameterException
			);
		}
	});
});
