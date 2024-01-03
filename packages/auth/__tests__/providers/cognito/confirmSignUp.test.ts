// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { confirmSignUp } from '../../../src/providers/cognito';
import { confirmSignUp as providerConfirmSignUp } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmSignUpException } from '../../../src/providers/cognito/types/errors';
import { ConfirmSignUpCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { getMockError } from './testUtils/data';
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

describe('confirmSignUp', () => {
	const { user1 } = authAPITestParams;
	const confirmationCode = '123456';
	// assert mocks
	const mockConfirmSignUp = providerConfirmSignUp as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockConfirmSignUp.mockResolvedValue({} as ConfirmSignUpCommandOutput);
	});

	afterEach(() => {
		mockConfirmSignUp.mockReset();
	});

	it('should call confirmSignUp and return a SignUpResult', async () => {
		const result = await confirmSignUp({
			username: user1.username,
			confirmationCode,
		});
		expect(result).toEqual({
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
			},
		});
		expect(mockConfirmSignUp).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			{
				ClientMetadata: undefined,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			}
		);
		expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
	});

	it('should contain force alias creation', async () => {
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
			options: {
				forceAliasCreation: true,
			},
		});
		expect(mockConfirmSignUp).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				ClientMetadata: undefined,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: true,
			})
		);
	});

	it('should contain clientMetadata from request', async () => {
		const clientMetadata = { data: 'abcd' };
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
			options: {
				clientMetadata,
			},
		});
		expect(mockConfirmSignUp).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				ClientMetadata: clientMetadata,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			})
		);
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignUp({ username: '', confirmationCode });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmSignUpUsername
			);
		}
	});

	it('should throw an error when confirmation code is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignUp({ username: user1.username, confirmationCode: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyConfirmSignUpCode);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockConfirmSignUp.mockImplementation(() => {
			throw getMockError(ConfirmSignUpException.InvalidParameterException);
		});
		try {
			await confirmSignUp({ username: user1.username, confirmationCode });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ConfirmSignUpException.InvalidParameterException);
		}
	});

	it('should send UserContextData', async () => {
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
		const result = await confirmSignUp({
			username: user1.username,
			confirmationCode,
		});
		expect(result).toEqual({
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
			},
		});
		expect(mockConfirmSignUp).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			{
				ClientMetadata: undefined,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				UserContextData: { EncodedData: 'abcd' },
			}
		);
		expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
});
