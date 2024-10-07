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
	InitiateAuthCommandOutput,
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
	handleUserAuthFlow,
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
import { AuthError } from '../../../errors/AuthError';

// Extend the InitiateAuthCommandOutput to include AvailableChallenges
interface ExtendedInitiateAuthCommandOutput extends InitiateAuthCommandOutput {
	AvailableChallenges?: string[];
}

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
	const { username } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'USER_AUTH',
	};
	assertTokenProviderConfig(authConfig);
	const clientMetaData = input.options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername,
	);

	try {
		console.log('Initiating USER_AUTH flow', { username, clientMetaData });
		const response = (await handleUserAuthFlow(
			username,
			clientMetaData,
			authConfig,
		)) as ExtendedInitiateAuthCommandOutput;
		console.log('USER_AUTH flow response', { response });

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

		if (response.ChallengeName === 'SELECT_CHALLENGE') {
			const availableChallenges = response.AvailableChallenges || [];

			if (availableChallenges.length === 0) {
				throw new AuthError({
					name: 'AuthErrorCodes.NoAvailableChallenges',
					message: 'No challenges available for selection.',
					recoverySuggestion:
						'Check User Pool configuration and ensure USER_AUTH flow is correctly implemented.',
				});
			}

			console.log('SELECT_CHALLENGE response', {
				response,
				availableChallenges,
			});

			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONTINUE_SIGN_IN_WITH_SELECT_CHALLENGE',
					availableChallenges,
				},
			};
		}

		return getSignInResult({
			challengeName: response.ChallengeName as ChallengeName,
			challengeParameters: response.ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		cleanActiveSignInState();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
