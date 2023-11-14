// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { sendUserAttributeVerificationCode } from '../../../src/providers/cognito';
import { GetUserAttributeVerificationException } from '../../../src/providers/cognito/types/errors';
import * as getUserAttributeVerificationCodeClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { GetUserAttributeVerificationCodeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
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
describe('resendUserAttributeConfirmationCode API happy path cases', () => {
	let getUserAttributeVerificationCodeClientSpy;
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
		getUserAttributeVerificationCodeClientSpy = jest
			.spyOn(
				getUserAttributeVerificationCodeClient,
				'getUserAttributeVerificationCode'
			)
			.mockImplementationOnce(
				async () =>
					authAPITestParams.resendSignUpClientResult as GetUserAttributeVerificationCodeCommandOutput
			);
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		getUserAttributeVerificationCodeClientSpy.mockClear();
	});

	it('Should return a resendUserAttributeConfirmationCodeRequest', async () => {
		const result = await sendUserAttributeVerificationCode({
			userAttributeKey: 'email',
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);

		expect(getUserAttributeVerificationCodeClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				AttributeName: 'email',
				ClientMetadata: { foo: 'bar' },
			})
		);
		expect(getUserAttributeVerificationCodeClientSpy).toBeCalledTimes(1);
	});
});

describe('resendUserAttributeConfirmationCode API error path cases', () => {
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
				buildMockErrorResponse(
					GetUserAttributeVerificationException.InvalidParameterException
				)
			)
		);
		try {
			await sendUserAttributeVerificationCode({
				userAttributeKey: 'email',
				options: {
					clientMetadata: { foo: 'bar' },
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				GetUserAttributeVerificationException.InvalidParameterException
			);
		}
	});
});
