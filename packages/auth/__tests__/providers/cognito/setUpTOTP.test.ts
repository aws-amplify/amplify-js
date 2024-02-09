// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AssociateSoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { associateSoftwareToken } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { setUpTOTP } from '../../../src/providers/cognito';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

describe('setUpTOTP', () => {
	const secretCode = 'secret-code';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockAssociateSoftwareToken = associateSoftwareToken as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockAssociateSoftwareToken.mockResolvedValue({
			SecretCode: secretCode,
			$metadata: {},
		});
	});

	afterEach(() => {
		mockAssociateSoftwareToken.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('setUpTOTP API should call the UserPoolClient and should return a TOTPSetupDetails', async () => {
		const result = await setUpTOTP();
		expect(mockAssociateSoftwareToken).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			}
		);
		expect(result.sharedSecret).toEqual(secretCode);
		expect(result.getSetupUri('appName', 'amplify')).toBeInstanceOf(URL);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockAssociateSoftwareToken.mockImplementation(() => {
			throw getMockError(
				AssociateSoftwareTokenException.InvalidParameterException
			);
		});
		try {
			await setUpTOTP();
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AssociateSoftwareTokenException.InvalidParameterException
			);
		}
	});
});
