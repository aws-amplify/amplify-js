// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	VerifySoftwareTokenException,
	RespondToAuthChallengeException,
	AssociateSoftwareTokenException,
} from '../types/errors';
import {
	AuthSignInResult,
	AuthSignInStep,
	ConfirmSignInRequest,
} from '../../../types';
import { CognitoConfirmSignInOptions } from '../types';

import {
	cleanActiveSignInState,
	setActiveSignInState,
	signInStore,
} from '../utils/signInStore';
import { AuthError } from '../../../errors/AuthError';
import {
	getSignInResult,
	getSignInResultFromError,
	handleChallengeName,
} from '../utils/signInHelpers';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { AmplifyV6 } from '@aws-amplify/core';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/CognitoIdentityProvider/types';

/**
 * Continues or completes the sign in process when required by the initial call to `signIn`.
 *
 * @param confirmSignInRequest - The ConfirmSignInRequest object
 *
 * @throws  -{@link VerifySoftwareTokenException }:
 * Thrown due to an invalid MFA token.
 *
 * @throws  -{@link RespondToAuthChallengeException }:
 * Thrown due to an invalid auth challenge response.
 *
 * @throws  -{@link AssociateSoftwareTokenException}:
 * Thrown due to a service error during the MFA setup process.
 *
 * @throws  -{@link AuthValidationErrorCode }:
 * Thrown when `challengeResponse` is not defined.
 *
 * TODO: add config errors
 *
 * @returns AuthSignInResult
 *
 */
export async function confirmSignIn(
	confirmSignInRequest: ConfirmSignInRequest<CognitoConfirmSignInOptions>
): Promise<AuthSignInResult> {
	const { challengeResponse, options } = confirmSignInRequest;
	const { username, challengeName, signInSession } = signInStore.getState();

	const authConfig = AmplifyV6.getConfig().Auth;
	const clientMetaData =
		options?.serviceOptions?.clientMetadata || authConfig?.clientMetadata;

	assertValidationError(
		!!challengeResponse,
		AuthValidationErrorCode.EmptyChallengeResponse
	);

	if (!username || !challengeName || !signInSession)
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

	try {
		const {
			Session,
			ChallengeName,
			AuthenticationResult,
			ChallengeParameters,
		} = await handleChallengeName(
			username,
			challengeName as ChallengeName,
			signInSession,
			challengeResponse,
			authConfig,
			clientMetaData,
			options?.serviceOptions
		);

		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username,
			challengeName: ChallengeName as ChallengeName,
		});

		if (AuthenticationResult) {
			cleanActiveSignInState();
			await cacheCognitoTokens(AuthenticationResult);
			return {
				isSignedIn: true,
				nextStep: { signInStep: AuthSignInStep.DONE },
			};
		}

		return getSignInResult({
			challengeName: ChallengeName as ChallengeName,
			challengeParameters: ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
