// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { confirmUserAttribute } from '../../../src/providers/cognito';
import { VerifyUserAttributeException } from '../../../src/providers/cognito/types/errors';
import * as userPoolClients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { VerifyUserAttributeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
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

describe('confirm user attribute API happy path cases', () => {
	let confirmUserAttributeSpy;

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

		confirmUserAttributeSpy = jest
			.spyOn(userPoolClients, 'verifyUserAttribute')
			.mockImplementationOnce(
				async (): Promise<VerifyUserAttributeCommandOutput> => {
					return {
						$metadata: {},
					};
				}
			);
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		confirmUserAttributeSpy.mockClear();
	});

	test('confirmUserAttribute API should call the service', async () => {
		const confirmationCode = '123456';
		await confirmUserAttribute({
			userAttributeKey: 'email',
			confirmationCode,
		});

		expect(confirmUserAttributeSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				AttributeName: 'email',
				Code: confirmationCode,
			})
		);
	});
});

describe('confirmUserAttribute API error path cases:', () => {
	test('confirmUserAttribute API should raise a validation error when confirmationCode is not defined', async () => {
		try {
			const confirmationCode = '';
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmUserAttributeCode
			);
		}
	});
	test('confirmUserAttribute API should raise service error', async () => {
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
					VerifyUserAttributeException.InvalidParameterException
				)
			)
		);
		try {
			const confirmationCode = '123456';
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifyUserAttributeException.InvalidParameterException
			);
		}
	});
});
