// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { AuthSignInResult, SignInRequest } from '../../../types';
import { CognitoSignInOptions } from '../types';
/**
 * Signs a user in
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signIn(
	signInRequest: SignInRequest<CognitoSignInOptions>
): Promise<AuthSignInResult> {
	const authFlowType = signInRequest.options?.serviceOptions?.authFlowType;

	switch (authFlowType) {
		case 'USER_SRP_AUTH':
			return signInWithSRP(signInRequest);
		case 'USER_PASSWORD_AUTH':
			return signInWithUserPassword(signInRequest);
		case 'CUSTOM_WITHOUT_SRP':
			return signInWithCustomAuth(signInRequest);
		case 'CUSTOM_WITH_SRP':
			return signInWithCustomSRPAuth(signInRequest);
		default:
			return signInWithSRP(signInRequest);
	}
}
