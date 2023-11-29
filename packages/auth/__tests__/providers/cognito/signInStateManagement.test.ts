// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn, getCurrentUser } from '../../../src/providers/cognito';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInStore } from '../../../src/providers/cognito/utils/signInStore';
import { Amplify } from '@aws-amplify/core';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { cognitoUserPoolsTokenProvider } from '../../../src/providers/cognito/tokenProvider';
jest.mock('../../../src/providers/cognito/apis/getCurrentUser');

//  getCurrentUser is mocked so Hub is able to dispatch a mocked AuthUser
// before returning an `AuthSignInResult`
const mockedGetCurrentUser = getCurrentUser as jest.Mock;
describe('local sign-in state management tests', () => {
	const session = '1234234232';
	const challengeName = 'SMS_MFA';
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
	const authConfig = {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
		},
	};

	beforeEach(() => {
		cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
	});

	test('local state management should return state after signIn returns a ChallengeName', async () => {
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
				})
			);

		Amplify.configure({
			Auth: authConfig,
		});
		await signIn({
			username,
			password,
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		expect(localSignInState).toEqual({
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

	test('local state management should return empty state after signIn returns an AuthenticationResult', async () => {
		const handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput
			);

		Amplify.configure({
			Auth: authConfig,
		});
		await signIn({
			username,
			password,
		});
		mockedGetCurrentUser.mockImplementationOnce(async () => {
			return {
				username: 'username',
				userId: 'userId',
			};
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toHaveBeenCalledTimes(1);
		expect(localSignInState).toEqual({
			challengeName: undefined,
			signInSession: undefined,
			username: undefined,
		});

		handleUserSRPAuthflowSpy.mockClear();
		mockedGetCurrentUser.mockClear();
	});
});
