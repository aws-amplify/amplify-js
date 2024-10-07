// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import {
	ChallengeName,
	ChallengeParameters,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import {
	getActiveSignInUsername,
	getNewDeviceMetadata,
	getSignInResult,
	getSignInResultFromError,
} from '../utils/signInHelpers';
import {
	CognitoAuthSignInDetails,
	SignInWithUserAuthInput,
	SignInWithUserAuthOutput,
} from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
} from '../utils/signInStore';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { dispatchSignedInHubEvent } from '../utils/dispatchSignedInHubEvent';
import { tokenOrchestrator } from '../tokenProvider';
import { handleUserAuthFlow } from '../../../client/flows/userAuth/handleUserAuthFlow';

/**
 * Signs a user in through a registered email or phone number without a password by by receiving and entering an OTP.
 *
 * @param input - The SignInWithUserAuthInput object
 * @returns SignInWithUserAuthOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } - Cognito service errors
 * thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password -- needs to change
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signInWithUserAuth(
	input: SignInWithUserAuthInput,
): Promise<SignInWithUserAuthOutput> {
	const { username, password, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'USER_AUTH',
	};
	assertTokenProviderConfig(authConfig);
	const clientMetaData = options?.clientMetadata;
	const preferredChallenge = options?.preferredChallenge;

	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername,
	);

	try {
		const response = await handleUserAuthFlow({
			username,
			config: authConfig,
			tokenOrchestrator,
			clientMetadata: clientMetaData,
			preferredChallenge,
			password,
		});

		const activeUsername = getActiveSignInUsername(username);
		setActiveSignInState({
			signInSession: response.Session,
			username: activeUsername,
			challengeName: response.ChallengeName as ChallengeName,
			signInDetails,
		});

		if (response.AuthenticationResult) {
			cleanActiveSignInState();
			await cacheCognitoTokens({
				username: activeUsername,
				...response.AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetadata({
					userPoolId: authConfig.userPoolId,
					userPoolEndpoint: authConfig.userPoolEndpoint,
					newDeviceMetadata: response.AuthenticationResult.NewDeviceMetadata,
					accessToken: response.AuthenticationResult.AccessToken,
				}),
				signInDetails,
			});
			await dispatchSignedInHubEvent();

			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: response.ChallengeName as ChallengeName,
			challengeParameters: response.ChallengeParameters as ChallengeParameters,
			availableChallenges:
				'AvailableChallenges' in response
					? (response.AvailableChallenges as ChallengeName[])
					: undefined,
		});
	} catch (error) {
		cleanActiveSignInState();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
