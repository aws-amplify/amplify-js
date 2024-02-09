// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { VerifySoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { verifyTOTPSetup } from '../../../src/providers/cognito';
import { verifySoftwareToken } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
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

describe('verifyTOTPSetup', () => {
	const code = '123456';
	const friendlyDeviceName = 'FriendlyDeviceName';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockVerifySoftwareToken = verifySoftwareToken as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockVerifySoftwareToken.mockResolvedValue({});
	});

	afterEach(() => {
		mockVerifySoftwareToken.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should return successful response', async () => {
		await verifyTOTPSetup({
			code,
			options: { friendlyDeviceName },
		});

		expect(mockVerifySoftwareToken).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserCode: code,
				FriendlyDeviceName: friendlyDeviceName,
			})
		);
	});

	it('should throw an error when code is empty', async () => {
		expect.assertions(2);
		try {
			await verifyTOTPSetup({ code: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyVerifyTOTPSetupCode);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockVerifySoftwareToken.mockImplementation(() => {
			throw getMockError(
				VerifySoftwareTokenException.InvalidParameterException
			);
		});
		try {
			await verifyTOTPSetup({ code });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifySoftwareTokenException.InvalidParameterException
			);
		}
	});
});
