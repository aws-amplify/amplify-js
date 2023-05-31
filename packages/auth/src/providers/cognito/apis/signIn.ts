// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSignInResult, SignInRequest } from '../../../types';
import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors/service';
import { CognitoSignInOptions } from '../types/options/CognitoSignInOptions';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithSRP } from './signInWithSRP';

/**
 * Signs a user in
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  -Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown either username or password
 *  are not defined.
 *
 * TODO: add config errors
 */
export async function signIn(
	signInRequest: SignInRequest<CognitoSignInOptions>
): Promise<AuthSignInResult> {
	const authFlowType = signInRequest.options?.serviceOptions?.authFlowType;

	switch (authFlowType) {
		case 'USER_SRP_AUTH':
			return signInWithSRP(signInRequest);
		case 'USER_PASSWORD_AUTH':
		// TODO(israx): include USER_PASSWORD_AUTH API here
		case 'CUSTOM_WITHOUT_SRP':
			return signInWithCustomAuth(signInRequest);
		case 'CUSTOM_WITH_SRP':
		// TODO(israx): include CUSTOM_WITH_SRP API here
		default:
			return signInWithSRP(signInRequest);
	}
}
