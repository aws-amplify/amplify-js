// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import {
	SignInRequest,
	AuthSignInResult,
	AuthSignInStep,
} from '../../../types';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { CognitoSignInOptions } from '../types/options/CognitoSignInOptions';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/types/models';
import {
	handleCustomSRPAuthFlow,
	getSignInResult,
	getSignInResultFromError,
} from '../utils/signInHelpers';
import { setActiveSignInSession } from '../utils/activeSignInSession';

export async function signInWithCustomSRPAuth(
	signInRequest: SignInRequest<CognitoSignInOptions>
): Promise<AuthSignInResult> {
	const { username, password } = signInRequest;
	const metadata =
		signInRequest.options?.serviceOptions?.clientMetadata ||
		Amplify.config.clientMetadata;
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
		} = await handleCustomSRPAuthFlow(username, password, metadata);

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
