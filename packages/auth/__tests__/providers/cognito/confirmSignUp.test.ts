// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmSignUp } from '../../../src/providers/cognito';
import { AuthSignUpStep } from '../../../src/types';
import * as confirmSignUpClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmSignUpException } from '../../../src/providers/cognito/types/errors';
import { AmplifyV6, AmplifyErrorString } from '@aws-amplify/core';
import { ConfirmSignUpCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

describe('confirmSignUp API Happy Path Cases:', () => {
	let confirmSignUpClientSpy;
	const { user1 } = authAPITestParams;
	const confirmationCode = '123456';
	beforeEach(() => {
		confirmSignUpClientSpy = jest
			.spyOn(confirmSignUpClient, 'confirmSignUp')
			.mockImplementationOnce(
				async (
					
				): Promise<ConfirmSignUpCommandOutput> => {
					return {} as ConfirmSignUpCommandOutput;
				}
			);
	});
	afterEach(() => {
		confirmSignUpClientSpy.mockClear();
	});
	test('confirmSignUp API should call the UserPoolClient and should return a SignUpResult', async () => {
		const result = await confirmSignUp({
			username: user1.username,
			confirmationCode,
		});
		expect(result).toEqual({
			isSignUpComplete: true,
			nextStep: {
				signUpStep: AuthSignUpStep.DONE,
			},
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith({
			ClientMetadata: undefined,
			ConfirmationCode: confirmationCode,
			Username: user1.username,
			ForceAliasCreation: undefined,
		});
		expect(confirmSignUpClientSpy).toBeCalledTimes(1);
	});
	test('confirmSignUp API input should contain force alias creation', async () => {
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
			options: {
				serviceOptions: {
					forceAliasCreation: true,
				},
			},
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				ClientMetadata: undefined,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: true,
			})
		);
	});

	test('confirmSignUp API input should contain clientMetadata from request', async () => {
		const clientMetadata = { data: 'abcd' };
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
			options: {
				serviceOptions: {
					clientMetadata,
				},
			},
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				ClientMetadata: clientMetadata,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
			})
		);
	});

	test('confirmSignUp API input should contain clientMetadata from config', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				...authAPITestParams.configWithClientMetadata,
			},
		});
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				ClientMetadata:
					authAPITestParams.configWithClientMetadata.clientMetadata,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
			})
		);
	});
});

describe('confirmSignUp API Error Path Cases:', () => {
	const { user1 } = authAPITestParams;
	const globalMock = global as any;
	const confirmationCode = '123456';
	test('confirmSignUp API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignUp({ username: '', confirmationCode });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AuthValidationErrorCode.EmptyConfirmSignUpUsername
			);
		}
	});

	test('confirmSignUp API should throw a validation AuthError when confirmation code is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignUp({ username: user1.username, confirmationCode: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyConfirmSignUpCode);
		}
	});

	test('confirmSignUp API should expect a service error', async () => {
		expect.assertions(2);
		const serviceError = new Error('service error');
		serviceError.name = ConfirmSignUpException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await confirmSignUp({ username: user1.username, confirmationCode });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ConfirmSignUpException.InvalidParameterException);
		}
	});

	test(`confirmSignUp API should expect an unknown error
     when underlying error is not coming from the service`, async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);
		try {
			await confirmSignUp({ username: user1.username, confirmationCode });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});

	test('confirmSignUp API should expect an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			await confirmSignUp({ username: user1.username, confirmationCode });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});
