// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito';
import { signInWithCustomAuth } from '../../../src/providers/cognito/apis/signInWithCustomAuth';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { InitiateAuthCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import {
	CognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

Amplify.configure({
	Auth: authConfig,
});
CognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
describe('signIn API happy path cases', () => {
	let handleCustomAuthFlowWithoutSRPSpy;

	afterAll(() => {
		jest.restoreAllMocks();
	});
	beforeEach(() => {
		handleCustomAuthFlowWithoutSRPSpy = jest
			.spyOn(initiateAuthHelpers, 'handleCustomAuthFlowWithoutSRP')
			.mockImplementationOnce(
				async (): Promise<InitiateAuthCommandOutput> =>
					authAPITestParams.CustomChallengeResponse
			);
	});

	afterEach(() => {
		handleCustomAuthFlowWithoutSRPSpy.mockClear();
	});

	test('signIn API invoked with authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			options: {
				authFlowType: 'CUSTOM_WITHOUT_SRP',
			},
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledTimes(1);
	});

	test('signInWithCustomAuth API should return a SignInResult', async () => {
		const result = await signInWithCustomAuth({
			username: authAPITestParams.user1.username,
		});
		expect(result).toEqual(authAPITestParams.signInResultWithCustomAuth());
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledTimes(1);
	});
	test('handleCustomAuthFlowWithoutSRP should be called with clientMetada from request', async () => {
		const username = authAPITestParams.user1.username;

		await signInWithCustomAuth({
			username,
			options: authAPITestParams.configWithClientMetadata,
		});
		expect(handleCustomAuthFlowWithoutSRPSpy).toBeCalledWith(
			username,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig.Cognito,
			tokenOrchestrator
		);
	});
});

describe('Cognito ASF', () => {
	let initiateAuthSpy;

	afterAll(() => {
		jest.restoreAllMocks();
	});
	beforeEach(() => {
		initiateAuthSpy = jest
			.spyOn(clients, 'initiateAuth')
			.mockImplementationOnce(
				async (): Promise<InitiateAuthCommandOutput> => ({
					ChallengeName: 'SMS_MFA',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				})
			);
		// load Cognito ASF polyfill
		window['AmazonCognitoAdvancedSecurityData'] = {
			getData() {
				return 'abcd';
			},
		};
	});

	afterEach(() => {
		initiateAuthSpy.mockClear();
		window['AmazonCognitoAdvancedSecurityData'] = undefined;
	});

	test('signIn API should send UserContextData', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			options: {
				authFlowType: 'CUSTOM_WITHOUT_SRP',
			},
		});
		expect(initiateAuthSpy).toBeCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			{
				AuthFlow: 'CUSTOM_AUTH',
				AuthParameters: { USERNAME: 'user1' },
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				ClientMetadata: undefined,
				UserContextData: { EncodedData: 'abcd' },
			}
		);
	});
});
