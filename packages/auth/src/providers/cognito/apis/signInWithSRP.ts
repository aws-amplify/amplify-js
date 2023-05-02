// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import {
	SignInRequest,
	AuthSignInResult,
	AuthSignInStep,
} from '../../../types';
import { getSignInResult, getSignInResultFromError } from '../utils/AuthUtils';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { CognitoSignInOptions } from '../types/options/CognitoSignInOptions';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/types/models';
import {
	handlePasswordVerifierChallenge,
	handleUserSRPAuthFlow,
} from '../utils/InitiateAuthHelpers';
import { setActiveLocalSession } from '../utils/localSessionHelpers';

/**
 * Signs a user in
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 * Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown either username or password
 *  are not defined.
 *
 * TODO: add config errors
 */
export async function signInWithSRP(
	signInRequest: SignInRequest<CognitoSignInOptions>
): Promise<AuthSignInResult> {
	const { username, password } = signInRequest;
	const metadata = signInRequest.options?.serviceOptions?.clientMetaData;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignInPassword
	);

	try {
		const { ChallengeParameters: challengeParameters, Session: session } =
			await handleUserSRPAuthFlow(username, metadata);

		// Session used on RespondToAuthChallenge calls
		setActiveLocalSession(session);
		const response = await handlePasswordVerifierChallenge(
			password,
			challengeParameters as ChallengeParameters,
			metadata
		);

		const {
			ChallengeName,
			ChallengeParameters,
			AuthenticationResult,
			Session,
		} = response;

		if (AuthenticationResult) {
			// TODO(israx): cache tokens
			return {
				isSignedIn: true,
				nextStep: { signInStep: AuthSignInStep.DONE },
			};
		}

		// Session used on RespondToAuthChallenge calls
		setActiveLocalSession(Session);

		// TODO(israx): set AmplifyUserSession via singleton
		return getSignInResult({
			challengeName: ChallengeName as ChallengeName,
			challengeParameters: ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		setActiveLocalSession(undefined);
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
