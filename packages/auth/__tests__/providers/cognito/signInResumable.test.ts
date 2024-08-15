// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, syncSessionStorage } from '@aws-amplify/core';

import {
	cleanActiveSignInState,
	setActiveSignInState,
	signInStore,
} from '../../../src/providers/cognito/utils/signInStore';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
import {
	ChallengeName,
	RespondToAuthChallengeCommandOutput,
} from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signIn } from '../../../src/providers/cognito';

import { setUpGetConfig } from './testUtils/setUpGetConfig';
import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');
jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: {
		getConfig: jest.fn(() => ({})),
		ADD_OAUTH_LISTENER: jest.fn(() => ({})),
	},
	syncSessionStorage: {
		setItem: jest.fn((key, value) => {
			window.sessionStorage.setItem(key, value);
		}),
		getItem: jest.fn((key: string) => {
			return window.sessionStorage.getItem(key);
		}),
		removeItem: jest.fn((key: string) => {
			window.sessionStorage.removeItem(key);
		}),
	},
}));

jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider',
);

const signInStateKeys: Record<string, string> = {
	username: 'CognitoSignInState.username',
	challengeName: 'CognitoSignInState.challengeName',
	signInSession: 'CognitoSignInState.signInSession',
	expiry: 'CognitoSignInState.expiry',
};

const user1: Record<string, string> = {
	username: 'joonchoi',
	challengeName: 'CUSTOM_CHALLENGE',
	signInSession: '888577-ltfgo-42d8-891d-666l858766g7',
	expiry: '1234567',
};

describe('signInStore', () => {
	const authConfig = {
		Cognito: {
			userPoolClientId: '123456-abcde-42d8-891d-666l858766g7',
			userPoolId: 'us-west-7_ampjc',
		},
	};

	const session = '1234234232';
	const challengeName = 'SMS_MFA';
	const { username } = authAPITestParams.user1;
	const { password } = authAPITestParams.user1;

	beforeEach(() => {
		cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
	});

	beforeAll(() => {
		setUpGetConfig(Amplify);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('LocalSignInState is empty after initialization', async () => {
		const localSignInState = signInStore.getState();

		expect(localSignInState).toEqual({
			challengeName: undefined,
			signInSession: undefined,
			username: undefined,
		});
		cleanActiveSignInState();
	});

	test('State is set after calling setActiveSignInState', async () => {
		setActiveSignInState(user1);
		const localSignInState = signInStore.getState();

		expect(localSignInState).toEqual(user1);
		cleanActiveSignInState();
	});

	test('State is updated after calling SignIn', async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: challengeName,
					Session: session,
					$metadata: {},
					ChallengeParameters: {
						CODE_DELIVERY_DELIVERY_MEDIUM: 'SMS',
						CODE_DELIVERY_DESTINATION: '*******9878',
					},
				}),
			);

		await signIn({
			username,
			password,
		});
		const newLocalSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		expect(newLocalSignInState).toEqual({
			challengeName,
			signInSession: session,
			username,
			signInDetails: {
				loginId: username,
				authFlowType: 'USER_SRP_AUTH',
			},
		});
		handleUserSRPAuthflowSpy.mockClear();
	});

	test('Stored session is not expired thus State should be rehydrated', () => {
		syncSessionStorage.setItem(signInStateKeys.username, user1.username);
		syncSessionStorage.setItem(
			signInStateKeys.signInSession,
			user1.signInSession,
		);
		syncSessionStorage.setItem(
			signInStateKeys.challengeName,
			user1.challengeName,
		);
		syncSessionStorage.setItem(
			signInStateKeys.expiry,
			(new Date().getTime() + 9999999).toString(),
		);

		signInStore.dispatch({
			type: 'SET_INITIAL_STATE',
		});

		const localSignInState = signInStore.getState();

		expect(localSignInState).toEqual({
			username: user1.username,
			challengeName: user1.challengeName,
			signInSession: user1.signInSession,
		});
		cleanActiveSignInState();
	});

	test('Stored session is expired thus State should default to undefined', async () => {
		syncSessionStorage.setItem(signInStateKeys.username, user1.username);
		syncSessionStorage.setItem(
			signInStateKeys.signInSession,
			user1.signInSession,
		);
		syncSessionStorage.setItem(
			signInStateKeys.challengeName,
			user1.challengeName,
		);
		syncSessionStorage.setItem(
			signInStateKeys.expiry,
			(new Date().getTime() - 500000).toString(),
		);
		signInStore.dispatch({
			type: 'SET_INITIAL_STATE',
		});

		const localSignInState = signInStore.getState();

		expect(localSignInState).toEqual({
			username: undefined,
			challengeName: undefined,
			signInSession: undefined,
		});
		cleanActiveSignInState();
	});

	test('State SignInSession is updated after dispatching custom session value', () => {
		const newSignInSessionID = '135790-dodge-2468-9aaa-kersh23lad00';
		syncSessionStorage.setItem(signInStateKeys.username, user1.username);
		syncSessionStorage.setItem(
			signInStateKeys.signInSession,
			user1.signInSession,
		);
		syncSessionStorage.setItem(
			signInStateKeys.challengeName,
			user1.challengeName,
		);
		syncSessionStorage.setItem(
			signInStateKeys.expiry,
			(new Date().getTime() + 5000).toString(),
		);

		signInStore.dispatch({
			type: 'SET_INITIAL_STATE',
		});

		const localSignInState = signInStore.getState();
		expect(localSignInState).toEqual({
			username: user1.username,
			challengeName: user1.challengeName,
			signInSession: user1.signInSession,
		});

		signInStore.dispatch({
			type: 'SET_SIGN_IN_SESSION',
			value: newSignInSessionID,
		});

		const newLocalSignInState = signInStore.getState();
		expect(newLocalSignInState).toEqual({
			username: user1.username,
			challengeName: user1.challengeName,
			signInSession: newSignInSessionID,
		});
	});

	test('State Challenge Name is updated after dispatching custom challenge name', () => {
		const newChallengeName = 'RANDOM_CHALLENGE' as ChallengeName;
		syncSessionStorage.setItem(signInStateKeys.username, user1.username);
		syncSessionStorage.setItem(
			signInStateKeys.signInSession,
			user1.signInSession,
		);
		syncSessionStorage.setItem(
			signInStateKeys.challengeName,
			user1.challengeName,
		);
		syncSessionStorage.setItem(
			signInStateKeys.expiry,
			(new Date().getTime() + 5000).toString(),
		);

		signInStore.dispatch({
			type: 'SET_INITIAL_STATE',
		});

		const localSignInState = signInStore.getState();
		expect(localSignInState).toEqual({
			username: user1.username,
			challengeName: user1.challengeName,
			signInSession: user1.signInSession,
		});

		signInStore.dispatch({
			type: 'SET_CHALLENGE_NAME',
			value: newChallengeName,
		});

		const newLocalSignInState = signInStore.getState();
		expect(newLocalSignInState).toEqual({
			username: user1.username,
			challengeName: newChallengeName,
			signInSession: user1.signInSession,
		});
	});
});
