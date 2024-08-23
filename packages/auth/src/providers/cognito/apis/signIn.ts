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

/**
 * Signs a user in
 *
 * For signIn{@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/enable-sign-up/#sign-in}
 * For Manage SMS MFA during sign-in {@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/manage-mfa/#manage-sms-mfa-during-sign-in}
 * Pre Aithentication and Pre Sign-up Lambda triggers {@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/advanced-workflows/#pre-authentication-and-pre-sign-up-lambda-triggers}
 * @param input -  The SignInInput object
 * @returns SignInOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signIn(input: SignInInput): Promise<SignInOutput> {
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
		default:
			return signInWithSRP(input);
	}
}
