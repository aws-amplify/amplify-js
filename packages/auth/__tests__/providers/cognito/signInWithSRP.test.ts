// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito';
import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import {
	CognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

CognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
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
			authConfig.Cognito,
			tokenOrchestrator
		);
	});
});
