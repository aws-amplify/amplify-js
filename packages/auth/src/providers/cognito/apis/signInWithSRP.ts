// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/CognitoIdentityProvider/types';
import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import {
	getNewDeviceMetatada,
	getSignInResult,
	getSignInResultFromError,
	handleUserSRPAuthFlow,
} from '../utils/signInHelpers';
import { SignInWithSRPInput, SignInWithSRPOutput } from '../types';
import {
	setActiveSignInState,
	cleanActiveSignInState,
} from '../utils/signInStore';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';

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
	input: SignInWithSRPInput
): Promise<SignInWithSRPOutput> {
	const { username, password } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const clientMetaData = input.options?.serviceOptions?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignInPassword
	);

	try {
		const {
			ChallengeName,
			ChallengeParameters,
			AuthenticationResult,
			Session,
		} = await handleUserSRPAuthFlow(
			username,
			password,
			clientMetaData,
			authConfig
		);

		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username,
			challengeName: ChallengeName as ChallengeName,
		});
		if (AuthenticationResult) {
			cleanActiveSignInState();
			await cacheCognitoTokens({
				...AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetatada(
					Amplify,
					AuthenticationResult.NewDeviceMetadata,
					AuthenticationResult.AccessToken
				),
			});
			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: ChallengeName as ChallengeName,
			challengeParameters: ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		cleanActiveSignInState();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
