// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, AmplifyErrorString } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInWithUserPassword } from '../../../src/providers/cognito/apis/signInWithUserPassword';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

AmplifyV6.configure({
	Auth: {
		userPoolWebClientId: '4a93aeb3-01af-42d8-891d-ee8aa1549398',
		userPoolId: 'us-west-2_80ede80b',
	},
});

describe('signIn API happy path cases', () => {
	let handleUserPasswordFlowSpy;

	beforeEach(() => {
		handleUserPasswordFlowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserPasswordAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});

	afterEach(() => {
		handleUserPasswordFlowSpy.mockClear();
	});

	test('signIn API invoked with authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				serviceOptions: {
					authFlowType: 'USER_PASSWORD_AUTH',
				},
			},
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserPasswordFlowSpy).toBeCalledTimes(1);
	});

	test('handleUserPasswordAuthFlow should be called with clientMetada from request', async () => {
		const username = authAPITestParams.user1.username;
		const password = authAPITestParams.user1.password;
		await signInWithUserPassword({
			username,
			password,
			options: {
				serviceOptions: authAPITestParams.configWithClientMetadata,
			},
		});
		expect(handleUserPasswordFlowSpy).toBeCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata
		);
	});

	test('handleUserPasswordAuthFlow should be called with clientMetada from config', async () => {
		const username = authAPITestParams.user1.username;
		const password = authAPITestParams.user1.password;
		AmplifyV6.configure({
			Auth: {
				...authAPITestParams.configWithClientMetadata,
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
		await signInWithUserPassword({
			username,
			password,
		});
		expect(handleUserPasswordFlowSpy).toBeCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata
		);
	});
});

describe('signIn API error path cases:', () => {
	const globalMock = global as any;

	test('signIn API should throw a validation AuthError when username is empty', async () => {
		expect.assertions(2);
		try {
			await signIn({ username: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptySignInUsername);
		}
	});

	test('signIn API should raise service error', async () => {
		const serviceError = new Error('service error');
		serviceError.name = InitiateAuthException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		expect.assertions(3);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error) {
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InvalidParameterException);
		}
	});

	test(`signIn API should raise an unknown error when underlying error is' 
			not coming from the service`, async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});

	test('signIn API should raise an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});
