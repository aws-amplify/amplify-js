// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { updatePassword } from '../../../src/providers/cognito';
import { ChangePasswordException } from '../../../src/providers/cognito/types/errors';
import { changePassword } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
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

describe('updatePassword', () => {
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockChangePassword = changePassword as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockChangePassword.mockResolvedValue({});
	});

	afterEach(() => {
		mockChangePassword.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should call changePassword', async () => {
		await updatePassword({ oldPassword, newPassword });

		expect(mockChangePassword).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				PreviousPassword: oldPassword,
				ProposedPassword: newPassword,
			})
		);
	});

	it('should throw an error when oldPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword: '', newPassword });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	it('should throw an error when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword, newPassword: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockChangePassword.mockImplementation(() => {
			throw getMockError(ChangePasswordException.InvalidParameterException);
		});

		try {
			await updatePassword({ oldPassword, newPassword });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ChangePasswordException.InvalidParameterException
			);
		}
	});
});
