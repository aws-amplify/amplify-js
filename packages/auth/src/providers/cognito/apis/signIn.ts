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
export function signIn(
	input: SignInInputWithOptionalPassword
): Promise<SignInOutput>;

/**
 * Signs a user in with a registered email instead of a password. The sign-in must be confirmed by the MagicLink
 * delivered to the email.
 * @param input -  The SignInPasswordlessWithEmailAndMagicLinkInput object
 * @returns SignInPasswordlessWithEmailAndMagicLinkOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown username or passwordless
 *   option is invalid
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithEmailAndMagicLinkInput
): Promise<SignInPasswordlessWithEmailAndMagicLinkOutput>;

/**
 * Signs a user in with a registered email instead of a password. The sign-in must be confirmed by an One-time pin
 * delivered to the email.
 * @param input -  The SignInPasswordlessWithEmailAndOTPInput object
 * @returns SignInPasswordlessWithEmailAndOTPOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown username or passwordless
 *   option is invalid
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithEmailAndOTPInput
): Promise<SignInPasswordlessWithEmailAndOTPOutput>;

/**
 * Signs a user in with a registered phone number instead of a password. The sign-in must be confirmed by an One-time
 * pin delivered to the SMS.
 * @param input -  The SignInPasswordlessWithSMSAndOTPInput object
 * @returns SignInPasswordlessWithSMSAndOTPOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown username or passwordless
 *   option is invalid
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithSMSAndOTPInput
): Promise<SignInPasswordlessWithSMSAndOTPOutput>;

export async function signIn(
	input:
		| SignInInputWithOptionalPassword
		| SignInPasswordlessWithEmailAndMagicLinkInput
		| SignInPasswordlessWithEmailAndOTPInput
		| SignInPasswordlessWithSMSAndOTPInput
) {
	await assertUserNotAuthenticated();
	if (input.passwordless) {
		// Iterate through signInPasswordless calls to make TypeScript happy
		const { deliveryMedium, method } = input.passwordless;
		if (deliveryMedium === 'EMAIL' && method === 'MAGIC_LINK') {
			return signInPasswordless({
				...input,
				passwordless: {
					deliveryMedium,
					method,
				},
			});
		} else if (deliveryMedium === 'EMAIL' && method === 'OTP') {
			return signInPasswordless({
				...input,
				passwordless: {
					deliveryMedium,
					method,
				},
			});
		} else if (deliveryMedium === 'SMS' && method === 'OTP') {
			return signInPasswordless({
				...input,
				passwordless: {
					deliveryMedium,
					method,
				},
			});
		} else {
			// TODO: implement validation error
			throw new Error('SMS does not support MagicLink');
		}
	} else {
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
	}
}
