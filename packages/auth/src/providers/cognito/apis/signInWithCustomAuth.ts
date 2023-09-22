// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import {
	handleCustomAuthFlowWithoutSRP,
	getSignInResult,
	getSignInResultFromError,
	getNewDeviceMetatada,
} from '../utils/signInHelpers';
import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { InitiateAuthException } from '../types/errors';
import {
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
	input: SignInWithCustomAuthInput
): Promise<SignInWithCustomAuthOutput> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { username, password, options } = input;
	const metadata = options?.serviceOptions?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!password,
		AuthValidationErrorCode.CustomAuthSignInPassword
	);

	try {
		const {
			ChallengeName,
			ChallengeParameters,
			AuthenticationResult,
			Session,
		} = await handleCustomAuthFlowWithoutSRP(username, metadata, authConfig);

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
