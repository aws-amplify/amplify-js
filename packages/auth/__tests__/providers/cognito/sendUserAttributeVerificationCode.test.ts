// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { sendUserAttributeVerificationCode } from '../../../src/providers/cognito';
import { GetUserAttributeVerificationException } from '../../../src/providers/cognito/types/errors';
import { getUserAttributeVerificationCode } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('sendUserAttributeVerificationCode', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockGetUserAttributeVerificationCode =
		getUserAttributeVerificationCode as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockGetUserAttributeVerificationCode.mockResolvedValue(
			authAPITestParams.resendSignUpClientResult
		);
	});

	afterEach(() => {
		mockGetUserAttributeVerificationCode.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should return a result', async () => {
		const result = await sendUserAttributeVerificationCode({
			userAttributeKey: 'email',
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});
		expect(result).toEqual(authAPITestParams.resendSignUpAPIResult);

		expect(mockGetUserAttributeVerificationCode).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				AttributeName: 'email',
				ClientMetadata: { foo: 'bar' },
			})
		);
		expect(mockGetUserAttributeVerificationCode).toHaveBeenCalledTimes(1);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockGetUserAttributeVerificationCode.mockImplementation(() => {
			throw getMockError(
				GetUserAttributeVerificationException.InvalidParameterException
			);
		});
		try {
			await sendUserAttributeVerificationCode({
				userAttributeKey: 'email',
				options: {
					clientMetadata: { foo: 'bar' },
				},
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				GetUserAttributeVerificationException.InvalidParameterException
			);
		}
	});
});
