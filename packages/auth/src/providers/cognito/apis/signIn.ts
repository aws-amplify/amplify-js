// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import {
	signInPasswordless,
	isSignInWithEmailAndMagicLinkInput,
	isSignInWithEmailAndOTPInput,
	isSignInWithSMSAndOTPInput,
} from './passwordless';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';

import {
	SignInWithPasswordInput,
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndOTPInput,
	SignInWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignInWithEmailAndMagicLinkOutput,
	SignInWithEmailAndOTPOutput,
	SignInWithPasswordOutput,
	SignInWithSMSAndOTPOutput,
} from '../types/outputs';

import type { AuthValidationErrorCode } from '../../../errors/types/validation';
import type { confirmSignIn } from './confirmSignIn';

/**
 * Signs a user in with optional password. It uses either of the following sign-in flow:
 * * 'USER_SRP_AUTH'
 * * 'CUSTOM_WITH_SRP'
 * * 'CUSTOM_WITHOUT_SRP'
 * * 'USER_PASSWORD_AUTH'
 *
 * @param input -  The {@link SignInWithPasswordInput} object
 * @returns The {@link SignInWithPasswordOutput} object
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `password` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInWithPasswordInput
): Promise<SignInWithPasswordOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a MagicLink to a registered email address. The sign-in flow is
 * completed by calling the {@link confirmSignIn} API with the code extracted from the MagicLink delivered to the
 * registered email address.
 *
 * @param input -  The {@link SignInWithEmailAndMagicLinkInput} object
 * @returns The {@link SignInWithEmailAndMagicLinkOutput} object
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInWithEmailAndMagicLinkInput
): Promise<SignInWithEmailAndMagicLinkOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a one-time password to a registered email address. The sign-in flow
 * is completed by calling the {@link confirmSignIn} API with the one-time password delivered to the registered email
 * address.
 *
 * @param input -  The {@link SignInWithEmailAndOTPInput} object
 * @returns The {@link SignInWithEmailAndOTPOutput} object
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInWithEmailAndOTPInput
): Promise<SignInWithEmailAndOTPOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a one-time password to a registered phone number via SMS. The
 * sign-in flow is completed by calling the {@link confirmSignIn} API with the one-time password delivered to the
 * registered phone number via SMS.
 *
 * @param input -  The {@link SignInWithSMSAndOTPInput} object
 * @returns The {@link SignInWithSMSAndOTPOutput} object
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInWithSMSAndOTPInput
): Promise<SignInWithSMSAndOTPOutput>;

export async function signIn(
	input:
		| SignInWithPasswordInput
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput
) {
	await assertUserNotAuthenticated();
	if (input.passwordless) {
		if (isSignInWithEmailAndMagicLinkInput(input)) {
			return signInPasswordless(input);
		} else if (isSignInWithEmailAndOTPInput(input)) {
			return signInPasswordless(input);
		} else if (isSignInWithSMSAndOTPInput(input)) {
			return signInPasswordless(input);
		} else {
			// TODO: implement validation error
			throw new Error('SMS does not support MagicLink');
		}
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
}
