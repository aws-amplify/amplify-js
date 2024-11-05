// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';

import { signIn } from '../../../src/providers/cognito';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInWithCustomSRPAuth } from '../../../src/providers/cognito/apis/signInWithCustomSRPAuth';
import {
	cognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';
import { createInitiateAuthClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};
cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
});

describe('signIn API happy path cases', () => {
	let handleCustomSRPAuthFlowSpy: jest.SpyInstance;

	beforeEach(() => {
		handleCustomSRPAuthFlowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleCustomSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => {
					return authAPITestParams.CustomChallengeResponse;
				},
			);
	});

	afterEach(() => {
		handleCustomSRPAuthFlowSpy.mockClear();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('signIn API invoked with CUSTOM_WITH_SRP authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				authFlowType: 'CUSTOM_WITH_SRP',
			},
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomSRPAuthFlowSpy).toHaveBeenCalledTimes(1);
	});

	test('signInWithCustomSRPAuth API should return a SignInResult', async () => {
		const result = await signInWithCustomSRPAuth({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomSRPAuthFlowSpy).toHaveBeenCalledTimes(1);
	});

	test('handleCustomSRPAuthFlow should be called with clientMetada from request', async () => {
		const { username } = authAPITestParams.user1;
		const { password } = authAPITestParams.user1;
		await signInWithCustomSRPAuth({
			username,
			password,
			options: authAPITestParams.configWithClientMetadata,
		});
		expect(handleCustomSRPAuthFlowSpy).toHaveBeenCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig.Cognito,
			tokenOrchestrator,
		);
	});
});

describe('Cognito ASF', () => {
	const mockInitiateAuth = jest.fn();
	const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);

	afterAll(() => {
		jest.restoreAllMocks();
	});
	beforeEach(() => {
		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeName: 'SRP_AUTH',
			Session: '1234234232',
			$metadata: {},
			ChallengeParameters: {
				USER_ID_FOR_SRP: authAPITestParams.user1.username,
			},
		});
		mockCreateInitiateAuthClient.mockReturnValueOnce(mockInitiateAuth);

		// load Cognito ASF polyfill
		(window as any).AmazonCognitoAdvancedSecurityData = {
			getData() {
				return 'abcd';
			},
		};
	});

	afterEach(() => {
		mockInitiateAuth.mockClear();
		mockCreateInitiateAuthClient.mockClear();
		(window as any).AmazonCognitoAdvancedSecurityData = undefined;
	});

	test('signIn API invoked with CUSTOM_WITH_SRP should send UserContextData', async () => {
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					authFlowType: 'CUSTOM_WITH_SRP',
				},
			});
		} catch (_) {
			// only want to test the contents
		}
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				UserContextData: {
					EncodedData: 'abcd',
				},
			}),
		);
	});
});
