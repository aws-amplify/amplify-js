// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';
import { SignInInput, SignInOutput } from '../types';
import { AuthValidationErrorCode } from '../../../errors/types/validation';

import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { signInWithUserAuth } from './signInWithUserAuth';
import { resetAutoSignIn } from './autoSignIn';

/**
 * Signs a user in
 *
 * @param input -  The SignInInput object
 * @returns SignInOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signIn(input: SignInInput): Promise<SignInOutput> {
	// Here we want to reset the store but not reassign the callback.
	// The callback is reset when the underlying promise resolves or rejects.
	// With the advent of session based sign in, this guarantees that the signIn API initiates a new auth flow,
	// regardless of whether it is called for a user currently engaged in an active auto sign in session.
	resetAutoSignIn(false);

	const authFlowType = input.options?.authFlowType;
	await assertUserNotAuthenticated();
	switch (authFlowType) {
		case 'USER_SRP_AUTH':
			return signInWithSRP(input);
		case 'USER_PASSWORD_AUTH':
			return signInWithUserPassword(input);
		case 'CUSTOM_WITHOUT_SRP':
			return signInWithCustomAuth(input);
		case 'CUSTOM_WITH_SRP':
			return signInWithCustomSRPAuth(input);
		case 'USER_AUTH':
			return signInWithUserAuth(input);
		default:
			return signInWithSRP(input);
	}
}
