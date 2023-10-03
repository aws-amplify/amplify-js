// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInWithCustomSRPAuth } from '../../../src/providers/cognito/apis/signInWithCustomSRPAuth';
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
	let handleCustomSRPAuthFlowSpy;

	beforeEach(() => {
		handleCustomSRPAuthFlowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleCustomSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => {
					return authAPITestParams.CustomChallengeResponse;
				}
			);
	});

	afterEach(() => {
		handleCustomSRPAuthFlowSpy.mockClear();
	});

	test('signIn API invoked with CUSTOM_WITH_SRP authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				serviceOptions: {
					authFlowType: 'CUSTOM_WITH_SRP',
				},
			},
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomSRPAuthFlowSpy).toBeCalledTimes(1);
	});

	test('signInWithCustomSRPAuth API should return a SignInResult', async () => {
		const result = await signInWithCustomSRPAuth({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomSRPAuthFlowSpy).toBeCalledTimes(1);
	});

	test('handleCustomSRPAuthFlow should be called with clientMetada from request', async () => {
		const username = authAPITestParams.user1.username;
		const password = authAPITestParams.user1.password;
		await signInWithCustomSRPAuth({
			username,
			password,
			options: {
				serviceOptions: authAPITestParams.configWithClientMetadata,
			},
		});
		expect(handleCustomSRPAuthFlowSpy).toBeCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig.Cognito,
			tokenOrchestrator
		);
	});
});
