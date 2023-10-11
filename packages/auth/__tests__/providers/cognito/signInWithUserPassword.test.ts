// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInWithUserPassword } from '../../../src/providers/cognito/apis/signInWithUserPassword';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
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

CognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
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
				authFlowType: 'USER_PASSWORD_AUTH',
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
			options: authAPITestParams.configWithClientMetadata,
		});
		expect(handleUserPasswordFlowSpy).toBeCalledWith(
			username,
			password,
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
			.mockImplementationOnce(async () => ({
				ChallengeName: 'SRP_AUTH',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					USER_ID_FOR_SRP: authAPITestParams.user1.username,
				},
			}));
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
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
				options: {
					serviceOptions: {
						authFlowType: 'USER_PASSWORD_AUTH',
					},
				},
			});
		} catch (_) {
			// only want to test the contents
		}
		expect(initiateAuthSpy).toBeCalledWith(
			expect.objectContaining({
				region: 'us-west-2',
			}),
			expect.objectContaining({
				UserContextData: {
					EncodedData: 'abcd',
				},
			})
		);
	});
});
