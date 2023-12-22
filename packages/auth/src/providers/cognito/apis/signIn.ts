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
import {
	assertUserNotAuthenticated,
	isSignInPasswordlessWithEmailAndMagicLinkInput,
	isSignInPasswordlessWithEmailAndOTPInput,
	isSignInPasswordlessWithSMSAndOTPInput,
} from '../utils/signInHelpers';

import { SignInInput, SignInOutput } from '../types';
import {
	SignInWithOptionalPasswordInput,
	SignInPasswordlessWithEmailAndMagicLinkInput,
	SignInPasswordlessWithEmailAndOTPInput,
	SignInPasswordlessWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignInPasswordlessWithEmailAndMagicLinkOutput,
	SignInPasswordlessWithEmailAndOTPOutput,
	SignInPasswordlessWithSMSAndOTPOutput,
	SignInWithOptionalPasswordOutput,
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
 * @param input -  The {@link SignInWithOptionalPasswordInput} object
 * @returns - {@link SignInWithOptionalPasswordInput}
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `password` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInWithOptionalPasswordInput
): Promise<SignInWithOptionalPasswordOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a MagicLink to a registered email address. The sign-in flow is
 * completed by calling the {@link confirmSignIn} API with the code extracted from the MagicLink delivered to the
 * registered email address.
 *
 * @param input -  The {@link SignInPasswordlessWithEmailAndMagicLinkInput} object
 * @returns - {@link SignInPasswordlessWithEmailAndMagicLinkOutput}
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithEmailAndMagicLinkInput
): Promise<SignInPasswordlessWithEmailAndMagicLinkOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a one-time password to a registered email address. The sign-in flow
 * is completed by calling the {@link confirmSignIn} API with the one-time password delivered to the registered email
 * address.
 *
 * @param input -  The SignInPasswordlessWithEmailAndOTPInput object
 * @returns SignInPasswordlessWithEmailAndOTPOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithEmailAndOTPInput
): Promise<SignInPasswordlessWithEmailAndOTPOutput>;

/**
 * Initiates a passwordless sign-in flow by sending a one-time password to a registered phone number via SMS. The
 * sign-in flow is completed by calling the {@link confirmSignIn} API with the one-time password delivered to the
 * registered phone number via SMS.
 *
 * @param input -  The SignInPasswordlessWithSMSAndOTPInput object
 * @returns SignInPasswordlessWithSMSAndOTPOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(
	input: SignInPasswordlessWithSMSAndOTPInput
): Promise<SignInPasswordlessWithSMSAndOTPOutput>;

/**
 * Signs a user in.
 *
 * @param input -  The {@link SignInInput} object
 * @returns - {@link SignInOutput}
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } for Cognito service errors
 *   during the sign-in process.
 * @throws AuthValidationErrorCode when `username` or `password` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signIn(input: SignInInput): Promise<SignInOutput>;

export async function signIn(input: SignInInput) {
	await assertUserNotAuthenticated();
	if (input.passwordless) {
		if (isSignInPasswordlessWithEmailAndMagicLinkInput(input)) {
			return signInPasswordless(input);
		} else if (isSignInPasswordlessWithEmailAndOTPInput(input)) {
			return signInPasswordless(input);
		} else if (isSignInPasswordlessWithSMSAndOTPInput(input)) {
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
