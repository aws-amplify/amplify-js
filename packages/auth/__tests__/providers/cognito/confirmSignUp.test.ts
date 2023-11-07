// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { confirmSignUp } from '../../../src/providers/cognito';
import * as confirmSignUpClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { AuthError } from '../../../src/errors/AuthError';
import { ConfirmSignUpException } from '../../../src/providers/cognito/types/errors';
import { Amplify } from '@aws-amplify/core';
import { ConfirmSignUpCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

describe('confirmSignUp API Happy Path Cases:', () => {
	Amplify.configure({
		Auth: authConfig,
	});
	let confirmSignUpClientSpy;
	const { user1 } = authAPITestParams;
	const confirmationCode = '123456';
	beforeEach(() => {
		confirmSignUpClientSpy = jest
			.spyOn(confirmSignUpClient, 'confirmSignUp')
			.mockImplementationOnce(async (): Promise<ConfirmSignUpCommandOutput> => {
				return {} as ConfirmSignUpCommandOutput;
			});
	});
	afterEach(() => {
		confirmSignUpClientSpy.mockClear();
	});
	afterAll(() => {
		jest.restoreAllMocks();
	});
	test('confirmSignUp API should call the UserPoolClient and should return a SignUpResult', async () => {
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
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			{
				ClientMetadata: undefined,
				ConfirmationCode: confirmationCode,
				Username: user1.username,
				ForceAliasCreation: undefined,
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			}
		);
		expect(confirmSignUpClientSpy).toBeCalledTimes(1);
	});
	test('confirmSignUp API input should contain force alias creation', async () => {
		await confirmSignUp({
			username: user1.username,
			confirmationCode,
			options: {
				forceAliasCreation: true,
			},
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
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
				clientMetadata,
			},
		});
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
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
});

describe('confirmSignUp API Error Path Cases:', () => {
	Amplify.configure({
		Auth: authConfig,
	});
	const { user1 } = authAPITestParams;
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
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(ConfirmSignUpException.InvalidParameterException)
			)
		);
		try {
			await confirmSignUp({ username: user1.username, confirmationCode });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(ConfirmSignUpException.InvalidParameterException);
		}
	});
});

describe('Cognito ASF', () => {
	Amplify.configure({
		Auth: authConfig,
	});
	let confirmSignUpClientSpy;
	const { user1 } = authAPITestParams;
	const confirmationCode = '123456';
	beforeEach(() => {
		confirmSignUpClientSpy = jest
			.spyOn(confirmSignUpClient, 'confirmSignUp')
			.mockImplementationOnce(async (): Promise<ConfirmSignUpCommandOutput> => {
				return {} as ConfirmSignUpCommandOutput;
			});

		// load Cognito ASF polyfill
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
	});

	afterEach(() => {
		confirmSignUpClientSpy.mockClear();
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});
	afterAll(() => {
		jest.restoreAllMocks();
	});
	test('confirmSignUp should send UserContextData', async () => {
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
		expect(confirmSignUpClientSpy).toHaveBeenCalledWith(
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
		expect(confirmSignUpClientSpy).toBeCalledTimes(1);
	});
});
