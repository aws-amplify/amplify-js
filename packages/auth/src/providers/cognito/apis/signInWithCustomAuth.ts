// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import {
	getActiveSignInUsername,
	getNewDeviceMetatada,
	getSignInResult,
	getSignInResultFromError,
	handleCustomAuthFlowWithoutSRP,
	retryOnResourceNotFoundException,
} from '../utils/signInHelpers';
import { InitiateAuthException } from '../types/errors';
import {
	CognitoAuthSignInDetails,
	SignInWithCustomAuthInput,
	SignInWithCustomAuthOutput,
} from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
} from '../utils/signInStore';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/CognitoIdentityProvider/types';
import { tokenOrchestrator } from '../tokenProvider';
import { dispatchSignedInHubEvent } from '../utils/dispatchSignedInHubEvent';

/**
 * Signs a user in using a custom authentication flow without password
 *
 * @param input -  The SignInWithCustomAuthInput object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException } - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws SignInWithCustomAuthOutput - Thrown when the token provider config is invalid.
 */
export async function signInWithCustomAuth(
	input: SignInWithCustomAuthInput,
): Promise<SignInWithCustomAuthOutput> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { username, password, options } = input;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'CUSTOM_WITHOUT_SRP',
	};
	const metadata = options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername,
	);
	assertValidationError(
		!password,
		AuthValidationErrorCode.CustomAuthSignInPassword,
	);

	try {
		const {
			ChallengeName: retriedChallengeName,
			ChallengeParameters: retiredChallengeParameters,
			AuthenticationResult,
			Session,
		} = await retryOnResourceNotFoundException(
			handleCustomAuthFlowWithoutSRP,
			[username, metadata, authConfig, tokenOrchestrator],
			username,
			tokenOrchestrator,
		);
		const activeUsername = getActiveSignInUsername(username);
		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username: activeUsername,
			challengeName: retriedChallengeName as ChallengeName,
			signInDetails,
		});
		if (AuthenticationResult) {
			cleanActiveSignInState();

			await cacheCognitoTokens({
				username: activeUsername,
				...AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetatada(
					authConfig.userPoolId,
					AuthenticationResult.NewDeviceMetadata,
					AuthenticationResult.AccessToken,
				),
				signInDetails,
			});

			await dispatchSignedInHubEvent();

			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: retriedChallengeName as ChallengeName,
			challengeParameters: retiredChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		cleanActiveSignInState();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
