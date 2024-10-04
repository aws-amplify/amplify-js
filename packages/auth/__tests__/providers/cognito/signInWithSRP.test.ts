// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';

import { signIn } from '../../../src/providers/cognito';
import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import {
	cognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from '../../../src/providers/cognito/tokenProvider';
import { AuthError } from '../../../src';
import { createKeysForAuthStorage } from '../../../src/providers/cognito/tokenProvider/TokenStore';
import {
	createInitiateAuthClient,
	createRespondToAuthChallengeClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');

jest.mock('../../../src/providers/cognito/utils/srp', () => {
	return {
		...jest.requireActual('../../../src/providers/cognito/utils/srp'),
		getAuthenticationHelper: jest.fn(() => ({
			A: { toString: jest.fn() },
			getPasswordAuthenticationKey: jest.fn(),
		})),
		getSignatureString: jest.fn(),
	};
});
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

const mockedDeviceMetadata = {
	deviceKey: 'mockedKey',
	deviceGrouKey: 'mockedKey',
	randomPasswordKey: 'mockedKey',
};

const lastAuthUser = 'lastAuthUser';
const authKeys = createKeysForAuthStorage(
	'CognitoIdentityServiceProvider',
	`${authConfig.Cognito.userPoolClientId}.${lastAuthUser}`,
);

function setDeviceKeys() {
	localStorage.setItem(authKeys.deviceKey, mockedDeviceMetadata.deviceKey);
	localStorage.setItem(
		authKeys.deviceGroupKey,
		mockedDeviceMetadata.deviceGrouKey,
	);
	localStorage.setItem(
		authKeys.randomPasswordKey,
		mockedDeviceMetadata.randomPasswordKey,
	);
}
type DeviceKey = 'deviceKey' | 'deviceGroupKey' | 'randomPasswordKey';
function deleteDeviceKey(key: DeviceKey) {
	switch (key) {
		case 'deviceKey':
			localStorage.removeItem(authKeys.deviceKey);
			break;
		case 'deviceGroupKey':
			localStorage.removeItem(authKeys.deviceGroupKey);
			break;
		case 'randomPasswordKey':
			localStorage.removeItem(authKeys.randomPasswordKey);
			break;
	}
}

describe('signIn API happy path cases', () => {
	const handleUserSRPAuthflowSpy = jest.spyOn(
		initiateAuthHelpers,
		'handleUserSRPAuthFlow',
	);

	beforeEach(() => {
		handleUserSRPAuthflowSpy.mockImplementation(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);
	});

	afterEach(() => {
		handleUserSRPAuthflowSpy.mockClear();
	});

	test('signIn should retry on ResourceNotFoundException and delete device keys', async () => {
		setDeviceKeys();
		const handleUserPasswordAuthFlow = jest
			.spyOn(initiateAuthHelpers, 'handleUserPasswordAuthFlow')
			.mockImplementation(
				async (): Promise<RespondToAuthChallengeCommandOutput> => {
					const deviceKeys =
						await tokenOrchestrator.getDeviceMetadata(lastAuthUser);
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
				},
			);

		const result = await signIn({
			username: lastAuthUser,
			password: 'XXXXXXXX',
			options: {
				authFlowType: 'USER_PASSWORD_AUTH',
			},
		});

		expect(result).toEqual({
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
				additionalInfo: undefined,
			},
		});
		expect(handleUserPasswordAuthFlow).toHaveBeenCalledTimes(2);
		expect(await tokenOrchestrator.getDeviceMetadata(lastAuthUser)).toBeNull();
		handleUserPasswordAuthFlow.mockClear();
	});

	test('signIn API invoked with authFlowType should return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
			options: {
				authFlowType: 'USER_SRP_AUTH',
			},
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
	});

	test('signIn API should delegate to signinWithSRP API by default and return a SignInResult', async () => {
		const result = await signIn({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
	});

	test('signInWithSRP API should return a SignInResult', async () => {
		const result = await signInWithSRP({
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});
		expect(result).toEqual(authAPITestParams.signInResult());
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
	});

	test('handleUserSRPFlow  should be called with clientMetada from request', async () => {
		const { username } = authAPITestParams.user1;
		const { password } = authAPITestParams.user1;
		await signInWithSRP({
			username,
			password,
			options: authAPITestParams.configWithClientMetadata,
		});
		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledWith(
			username,
			password,
			authAPITestParams.configWithClientMetadata.clientMetadata,
			authConfig.Cognito,
			tokenOrchestrator,
		);
	});

	describe('sign in with device keys', () => {
		const mockInitiateAuth = jest.fn();
		const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);
		const mockRespondToAuthChallenge = jest.fn();
		const mockCreateRespondToAuthChallengeClient = jest.mocked(
			createRespondToAuthChallengeClient,
		);

		beforeEach(() => {
			setDeviceKeys();
			handleUserSRPAuthflowSpy.mockRestore();
			mockInitiateAuth.mockResolvedValueOnce({
				ChallengeName: 'SRP_AUTH',
				Session: '1234234232',
				$metadata: {},
				ChallengeParameters: {
					USER_ID_FOR_SRP: lastAuthUser,
				},
			});
			mockCreateInitiateAuthClient.mockReturnValueOnce(mockInitiateAuth);
			mockRespondToAuthChallenge.mockResolvedValueOnce(
				authAPITestParams.RespondToAuthChallengeCommandOutput,
			);
			mockCreateRespondToAuthChallengeClient.mockReturnValueOnce(
				mockRespondToAuthChallenge,
			);
		});

		afterEach(() => {
			mockInitiateAuth.mockClear();
			mockCreateInitiateAuthClient.mockClear();
			mockRespondToAuthChallenge.mockClear();
			mockCreateRespondToAuthChallengeClient.mockClear();
		});

		test('respondToAuthChallenge should include device key in the request', async () => {
			await signIn({
				username: lastAuthUser,
				password: 'XXXXXXXX',
			});

			expect(mockRespondToAuthChallenge).toHaveBeenCalledTimes(1);
			const deviceKeyFromRequest =
				mockRespondToAuthChallenge.mock.calls[0][1].ChallengeResponses
					?.DEVICE_KEY;
			expect(deviceKeyFromRequest).toBe('mockedKey');
		});
		const deviceKeys: DeviceKey[] = [
			'deviceKey',
			'deviceGroupKey',
			'randomPasswordKey',
		];
		test.each(deviceKeys)(
			'respondToAuthChallenge should not include device key in the request if any device key in storage is deleted',
			async deviceKey => {
				deleteDeviceKey(deviceKey);
				await signIn({
					username: lastAuthUser,
					password: 'XXXXXXXX',
				});

				expect(mockRespondToAuthChallenge).toHaveBeenCalledTimes(1);
				const deviceKeyFromRequest =
					mockRespondToAuthChallenge.mock.calls[0][1].ChallengeResponses
						?.DEVICE_KEY;
				expect(deviceKeyFromRequest).toBe(undefined);
			},
		);
	});
});

describe('Cognito ASF', () => {
	const mockInitiateAuth = jest.fn();
	const mockCreateInitiateAuthClient = jest.mocked(createInitiateAuthClient);

	beforeAll(() => {
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

	test('signIn SRP should send UserContextData', async () => {
		try {
			await signIn({
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
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
