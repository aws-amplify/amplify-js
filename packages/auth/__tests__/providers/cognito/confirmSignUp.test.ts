// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { confirmSignUp } from '../../../src/providers/cognito';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmSignUpException } from '../../../src/providers/cognito/types/errors';
import { createConfirmSignUpClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { ConfirmSignUpCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

describe('confirmSignUp', () => {
	const { user1 } = authAPITestParams;
	const confirmationCode = '123456';
	// assert mocks
	const mockConfirmSignUp = jest.fn();
	const mockCreateConfirmSignUpClient = jest.mocked(createConfirmSignUpClient);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	beforeEach(() => {
		mockConfirmSignUp.mockResolvedValue({} as ConfirmSignUpCommandOutput);
		mockCreateConfirmSignUpClient.mockReturnValueOnce(mockConfirmSignUp);
	});

	afterEach(() => {
		mockConfirmSignUp.mockReset();
		mockCreateConfirmSignUpClient.mockClear();
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
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
			},
		);
		expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		jest.mocked(Amplify.getConfig).mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});

		await confirmSignUp({
			username: user1.username,
			confirmationCode,
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
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
			}),
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
			}),
		);
	});

	it('should throw an error when username is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignUp({ username: '', confirmationCode });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmSignUpUsername,
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
		(window as any).AmazonCognitoAdvancedSecurityData = {
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
			},
		);
		expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
		(window as any).AmazonCognitoAdvancedSecurityData = undefined;
	});
});
