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
import { AuthSignInResult, AuthUser, SignInRequest } from '../../../types';
import { CognitoSignInOptions } from '../types';
import { getCurrentUser } from './getCurrentUser';
import { AuthError } from '../../../errors/AuthError';
import { USER_ALREADY_AUTHENTICATED_EXCEPTION } from '../../../errors/constants';

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
	await isUserAuthenticated();
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

async function isUserAuthenticated() {
	let authUser: AuthUser | undefined;
	try {
		authUser = await getCurrentUser();
	} catch (error) {}

	if (authUser && authUser.userId && authUser.username) {
		throw new AuthError({
			name: USER_ALREADY_AUTHENTICATED_EXCEPTION,
			message: 'There is already signed in user because auth tokens were found.',
			recoverySuggestion: 'Please call signOut before calling signIn again.',
		});
	}
}
