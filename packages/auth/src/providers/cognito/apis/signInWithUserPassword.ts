// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthSignInStep, SignInRequest } from '../../../types';
import { CognitoSignInOptions } from '../types/options/CognitoSignInOptions';
import { setActiveSignInSession } from '../utils/activeSignInSession';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/types/models';
import {
	getSignInResult,
	getSignInResultFromError,
	handleUserPasswordAuthFlow,
} from '../utils/signInHelpers';
import { InitiateAuthException } from '../types/errors/service';

/**
 * Signs a user in
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException } -
 * Cognito service error thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown either username or password
 *  are not defined.
 *
 * TODO: add config errors
 */
export async function signInWithUserPassword(
	signInRequest: SignInRequest<CognitoSignInOptions>
) {
	const { username, password } = signInRequest;
	const metadata = signInRequest.options?.serviceOptions?.clientMetadata;
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
		} = await handleUserPasswordAuthFlow(username, password, metadata);

		// Session used on RespondToAuthChallenge requests.
		setActiveSignInSession(Session);
		if (AuthenticationResult) {
			// TODO(israx): cache tokens
			return {
				isSignedIn: true,
				nextStep: { signInStep: AuthSignInStep.DONE },
			};
		}

		// TODO(israx): set AmplifyUserSession via singleton
		return getSignInResult({
			challengeName: ChallengeName as ChallengeName,
			challengeParameters: ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		setActiveSignInSession(undefined);
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
