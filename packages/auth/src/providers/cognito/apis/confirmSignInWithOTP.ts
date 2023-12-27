// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub } from '@aws-amplify/core';
import { respondToAuthChallenge } from '../utils/clients/CognitoIdentityProvider';
import {
	AMPLIFY_SYMBOL,
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { RespondToAuthChallengeCommandInput } from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { getAuthUserAgentValue } from '../../../utils';
import { ConfirmSignInOutput } from '../types/outputs';
import { cleanActiveSignInState, signInStore } from '../utils/signInStore';
import { AuthError } from '../../../errors/AuthError';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { getNewDeviceMetatada } from '../utils/signInHelpers';
import { getCurrentUser } from './getCurrentUser';

export type ConfirmSignInWithOTPInput = {
	challengeResponse: string;
};

export const confirmSignInWithOTP = async (
	input: ConfirmSignInWithOTPInput
): Promise<ConfirmSignInOutput> => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolId, userPoolClientId } = authConfig;
	const { challengeResponse } = input;
	assertValidationError(
		!!challengeResponse,
		AuthValidationErrorCode.EmptyChallengeResponse
	);
	const { username, signInSession, signInDetails } = signInStore.getState();

	if (!username || !signInSession)
		// TODO: remove this error message for production apps
		throw new AuthError({
			name: AuthErrorCodes.SignInException,
			message: `
			An error occurred during the sign in process. 
			
			This most likely occurred due to:
			1. signIn was not called before confirmSignIn.
			2. signIn threw an exception.
			3. page was refreshed during the sign in flow.
			`,
			recoverySuggestion:
				'Make sure a successful call to signIn is made before calling confirmSignIn' +
				'and that the page is not refreshed until the sign in process is done.',
		});
	const jsonReqRespondToAuthChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: {
			USERNAME: username,
			ANSWER: challengeResponse,
		},
		Session: signInSession,
		ClientMetadata: {
			'Amplify.Passwordless.signInMethod': 'OTP',
			'Amplify.Passwordless.action': 'CONFIRM',
		},
		ClientId: userPoolClientId,
	};
	const { AuthenticationResult, ChallengeName } = await respondToAuthChallenge(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		jsonReqRespondToAuthChallenge
	);
	if (AuthenticationResult) {
		cleanActiveSignInState();
		await cacheCognitoTokens({
			username,
			...AuthenticationResult,
			NewDeviceMetadata: await getNewDeviceMetatada(
				authConfig.userPoolId,
				AuthenticationResult.NewDeviceMetadata,
				AuthenticationResult.AccessToken
			),
			signInDetails,
		});
		Hub.dispatch(
			'auth',
			{
				event: 'signedIn',
				data: await getCurrentUser(),
			},
			'Auth',
			AMPLIFY_SYMBOL
		);
		return {
			isSignedIn: true,
			nextStep: { signInStep: 'DONE' },
		};
	}

	throw new Error(`ChallengeName: ${ChallengeName} is not implemented yet`);
};
