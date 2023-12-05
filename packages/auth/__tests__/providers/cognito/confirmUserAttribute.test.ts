// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { confirmUserAttribute } from '../../../src/providers/cognito';
import { VerifyUserAttributeException } from '../../../src/providers/cognito/types/errors';
import { verifyUserAttribute } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('confirmUserAttribute', () => {
	const confirmationCode = '123456';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockVerifyUserAttribute = verifyUserAttribute as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockVerifyUserAttribute.mockResolvedValue({ $metadata: {} });
	});

	afterEach(() => {
		mockVerifyUserAttribute.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should call the service', async () => {
		await confirmUserAttribute({
			userAttributeKey: 'email',
			confirmationCode,
		});

		expect(mockVerifyUserAttribute).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				AttributeName: 'email',
				Code: confirmationCode,
			})
		);
	});

	it('should throw an error when confirmationCode is not defined', async () => {
		try {
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode: '',
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmUserAttributeCode
			);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockVerifyUserAttribute.mockImplementation(() => {
			throw getMockError(
				VerifyUserAttributeException.InvalidParameterException
			);
		});
		try {
			await confirmUserAttribute({
				userAttributeKey: 'email',
				confirmationCode,
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifyUserAttributeException.InvalidParameterException
			);
		}
	});
});
