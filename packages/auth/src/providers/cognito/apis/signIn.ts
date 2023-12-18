// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { signInPasswordless } from './signInPasswordless';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';

import { SignInOutput } from '../types';
import {
	SignInInputWithOptionalPassword,
	SignInPasswordlessWithEmailAndMagicLinkInput,
	SignInPasswordlessWithEmailAndOTPInput,
	SignInPasswordlessWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignInPasswordlessWithEmailAndMagicLinkOutput,
	SignInPasswordlessWithEmailAndOTPOutput,
	SignInPasswordlessWithSMSAndOTPOutput,
} from '../types/outputs';

type SignInApi = {
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
	(input: SignInInputWithOptionalPassword): Promise<SignInOutput>;

	(
		input: SignInPasswordlessWithEmailAndMagicLinkInput
	): Promise<SignInPasswordlessWithEmailAndMagicLinkOutput>;

	(
		input: SignInPasswordlessWithEmailAndOTPInput
	): Promise<SignInPasswordlessWithEmailAndOTPOutput>;

	(
		input: SignInPasswordlessWithSMSAndOTPInput
	): Promise<SignInPasswordlessWithSMSAndOTPOutput>;
};

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
export const signIn: SignInApi = async (
	input
): Promise<{ isSignedIn: boolean; nextStep: any }> => {
	const { passwordless } = input;
	await assertUserNotAuthenticated();
	if (passwordless) {
		return signInPasswordless(
			input as Parameters<typeof signInPasswordless>[0]
		);
	}
	const authFlowType = input.options?.authFlowType;
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
};
