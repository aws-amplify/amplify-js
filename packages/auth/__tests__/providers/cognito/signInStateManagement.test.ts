// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { signInStore } from '../../../src/providers/cognito/utils/signInStore';
import { AmplifyV6 } from '@aws-amplify/core';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

describe('local sign-in state management tests', () => {
	const session = '1234234232';
	const challengeName = 'SMS_MFA';
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
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
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
		await signIn({
			username,
			password,
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
		expect(localSignInState).toEqual({
			challengeName,
			signInSession: session,
			username,
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
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
		await signIn({
			username,
			password,
		});

		const localSignInState = signInStore.getState();

		expect(handleUserSRPAuthflowSpy).toBeCalledTimes(1);
		expect(localSignInState).toEqual({
			challengeName: undefined,
			signInSession: undefined,
			username: undefined,
		});

		handleUserSRPAuthflowSpy.mockClear();
	});
});
