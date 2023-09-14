// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthSignInResult, SignInRequest } from '../../../types';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/CognitoIdentityProvider/types';
import {
	getSignInResult,
	getSignInResultFromError,
	handleUserPasswordAuthFlow,
} from '../utils/signInHelpers';
import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { InitiateAuthException } from '../types/errors';
import { CognitoSignInOptions } from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
} from '../utils/signInStore';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';

/**
 * Signs a user in using USER_PASSWORD_AUTH AuthFlowType
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException } - Cognito service error thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signInWithUserPassword(
	signInRequest: SignInRequest<CognitoSignInOptions>
): Promise<AuthSignInResult> {
	const { username, password, options } = signInRequest;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const metadata = options?.serviceOptions?.clientMetadata;
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
		} = await handleUserPasswordAuthFlow(
			username,
			password,
			metadata,
			authConfig
		);

		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username,
			challengeName: ChallengeName as ChallengeName,
		});
		if (AuthenticationResult) {
			await cacheCognitoTokens(AuthenticationResult);
			cleanActiveSignInState();
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
