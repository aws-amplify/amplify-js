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
	getSignInResult,
	getSignInResultFromError,
	handleUserSRPAuthFlow,
} from '../utils/signInHelpers';
import {
	CognitoAuthSignInDetails,
	SignInWithSRPInput,
	SignInWithSRPOutput,
} from '../types';
import {
	resetActiveSignInState,
	setActiveSignInState,
} from '../../../client/utils/store/signInStore';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { tokenOrchestrator } from '../tokenProvider';
import { dispatchSignedInHubEvent } from '../utils/dispatchSignedInHubEvent';
import { getNewDeviceMetadata } from '../utils/getNewDeviceMetadata';

import { resetAutoSignIn } from './autoSignIn';

/**
 * Signs a user in
 *
 * @param input - The SignInWithSRPInput object
 * @returns SignInWithSRPOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } - Cognito service errors
 * thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signInWithSRP(
	input: SignInWithSRPInput,
): Promise<SignInWithSRPOutput> {
	const { username, password } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'USER_SRP_AUTH',
	};
	assertTokenProviderConfig(authConfig);
	const clientMetaData = input.options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername,
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignInPassword,
	);

	try {
		const {
			ChallengeName: handledChallengeName,
			ChallengeParameters: handledChallengeParameters,
			AuthenticationResult,
			Session,
		} = await handleUserSRPAuthFlow(
			username,
			password,
			clientMetaData,
			authConfig,
			tokenOrchestrator,
		);

		const activeUsername = getActiveSignInUsername(username);
		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username: activeUsername,
			challengeName: handledChallengeName as ChallengeName,
			signInDetails,
		});
		if (AuthenticationResult) {
			await cacheCognitoTokens({
				username: activeUsername,
				...AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetadata({
					userPoolId: authConfig.userPoolId,
					userPoolEndpoint: authConfig.userPoolEndpoint,
					newDeviceMetadata: AuthenticationResult.NewDeviceMetadata,
					accessToken: AuthenticationResult.AccessToken,
				}),
				signInDetails,
			});
			resetActiveSignInState();

			await dispatchSignedInHubEvent();

			resetAutoSignIn();

			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: handledChallengeName as ChallengeName,
			challengeParameters: handledChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		resetActiveSignInState();
		resetAutoSignIn();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
