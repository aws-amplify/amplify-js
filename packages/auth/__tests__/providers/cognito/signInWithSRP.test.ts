// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString } from '@aws-amplify/core/internals/library-utils';

import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import { InitiateAuthException } from '../../../src/providers/cognito/types/errors';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { AmplifyV6 as Amplify } from 'aws-amplify';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

const authConfig = {
	userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: 'us-west-2_zzzzz',
};
const authConfigWithClientmetadata = {
	userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: 'us-west-2_zzzzz',
	...authAPITestParams.configWithClientMetadata,
};
Amplify.configure({
	Auth: authConfig,
});

describe('signIn API happy path cases', () => {
	let handleUserSRPAuthflowSpy;

	beforeEach(() => {
		handleUserSRPAuthflowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});

	afterEach(() => {
		handleUserSRPAuthflowSpy.mockClear();
	});

	test('signIn API invoked with authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				serviceOptions: {
					authFlowType: 'USER_SRP_AUTH',
				},
			},
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
	});

	test('signIn API should delegate to signinWithSRP API by default and return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
	});

	test('signInWithSRP API should return a SignInResult', async () => {
		const result = await signInWithSRP({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
	});

	test('handleUserSRPFlow  should be called with clientMetada from request', async () => {
		const username = authAPITestParams.user1.username;
		const password = authAPITestParams.user1.password;
		await signInWithSRP({
			username,
			password,
			options: {
				serviceOptions: authAPITestParams.configWithClientMetadata,
			},
		});
		expect(handleUserSRPAuthflowSpy).toBeCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig
		);
	});

	test('handleUserSRPFlow should be called with clientMetada from config', async () => {
		Amplify.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				...authAPITestParams.configWithClientMetadata,
			},
		});
		const username = authAPITestParams.user1.username;
		const password = authAPITestParams.user1.password;
		await signInWithSRP({
			username,
			password,
		});
		expect(handleUserSRPAuthflowSpy).toBeCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfigWithClientmetadata
		);
	});
});

describe('signIn API error path cases:', () => {
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
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(InitiateAuthException.InvalidParameterException)
			)
		);
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(InitiateAuthException.InvalidParameterException);
		}
	});
});
