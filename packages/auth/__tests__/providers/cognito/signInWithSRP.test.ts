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
import { AuthError } from '../../../src';
import { createKeysForAuthStorage } from '../../../src/providers/cognito/tokenProvider/TokenStore';
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

const mockedDeviceMetadata = {
	deviceKey: 'mockedKey',
	deviceGrouKey: 'mockedKey',
	randomPasswordKey: 'mockedKey',
};

const lastAuthUser = 'lastAuthUser';
const authKeys = createKeysForAuthStorage(
	'CognitoIdentityServiceProvider',
	`${authConfig.Cognito.userPoolClientId}.${lastAuthUser}`
);

function setDeviceKeys() {
	localStorage.setItem(authKeys.deviceKey, mockedDeviceMetadata.deviceKey);
	localStorage.setItem(
		authKeys.deviceGroupKey,
		mockedDeviceMetadata.deviceGrouKey
	);
	localStorage.setItem(
		authKeys.randomPasswordKey,
		mockedDeviceMetadata.randomPasswordKey
	);
}

describe('signIn API happy path cases', () => {
	let handleUserSRPAuthflowSpy;

	beforeEach(() => {
		handleUserSRPAuthflowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);
	});

	afterEach(() => {
		handleUserSRPAuthflowSpy.mockClear();
	});

	test('signIn should retry on ResourceNotFoundException and delete device keys', async () => {
		setDeviceKeys();
		handleUserSRPAuthflowSpy = jest
			.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> => {
					const deviceKeys = await tokenOrchestrator.getDeviceMetadata(
						lastAuthUser
					);
					if (deviceKeys) {
						throw new AuthError({
							name: 'ResourceNotFoundException',
							message: 'Device does not exist.',
						});
					}

					return {
						ChallengeName: 'CUSTOM_CHALLENGE',
						AuthenticationResult: undefined,
						Session: 'aaabbbcccddd',
						$metadata: {},
					};
				}
			);

		const result = await signIn({
			username: lastAuthUser,
			password: 'XXXXXXXX',
		});

		expect(result).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
				additionalInfo: undefined,
			},
		});
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(2);
		expect(await tokenOrchestrator.getDeviceMetadata(lastAuthUser)).toBeNull();
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

	test('signIn SRP should send UserContextData', async () => {
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
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
