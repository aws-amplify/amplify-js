// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../../errors/types/validation';
import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndMagicLinkOutput,
	SignInWithEmailAndOTPInput,
	SignInWithEmailAndOTPOutput,
	SignInWithSMSAndOTPInput,
	SignInWithSMSAndOTPOutput,
} from '../../types';
import {
	SignInWithPasswordInput,
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithPasswordInput,
	SignUpWithSMSAndOTPInput,
} from '../../types/inputs';

export const validatePasswordlessInput = (
	input:
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput,
	amplify: AmplifyClassV6
) => {
	assertValidationError(
		!!input.username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!input.password,
		AuthValidationErrorCode.PasswordlessSignInHasPassword
	);
	if (
		input.passwordless?.deliveryMedium === 'EMAIL' &&
		input.passwordless?.method === 'MAGIC_LINK'
	) {
		assertValidationError(
			!!amplify.libraryOptions.Auth?.magicLinkRedirectURL,
			AuthValidationErrorCode.EmptyPasswordlessRedirectURI
		);
	}
};

/**
 * General type that could be resolved to either of:
 * * {@link SignInWithEmailAndMagicLinkInput},
 * * {@link SignInWithEmailAndOTPInput},
 * * {@link SignInWithSMSAndOTPInput}.
 */
type PossibleSignInPasswordlessInput = {
	passwordless?: Record<string, unknown>;
};
type SignInInputTypes =
	| SignInWithPasswordInput
	| PossibleSignInPasswordlessInput;

export const isSignInWithEmailAndMagicLinkInput = (
	input: SignInInputTypes
): input is SignInWithEmailAndMagicLinkInput =>
	!!input.passwordless &&
	input.passwordless.deliveryMedium === 'EMAIL' &&
	input.passwordless.method === 'MAGIC_LINK';

export const isSignInWithEmailAndOTPInput = (
	input: SignInInputTypes
): input is SignInWithEmailAndOTPInput =>
	!!input.passwordless &&
	input.passwordless.deliveryMedium === 'EMAIL' &&
	input.passwordless.method === 'OTP';

export const isSignInWithSMSAndOTPInput = (
	input: SignInInputTypes
): input is SignInWithSMSAndOTPInput =>
	!!input.passwordless &&
	input.passwordless.deliveryMedium === 'SMS' &&
	input.passwordless.method === 'OTP';

/**
 * General type that could be resolved to either of:
 * * {@link SignUpWithEmailAndMagicLinkInput},
 * * {@link SignUpWithEmailAndOTPInput},
 * * {@link SignUpWithSMSAndOTPInput}.
 */
type PossibleSignUpPasswordlessInput = {
	passwordless?: Record<string, unknown>;
	options: { userAttributes: Record<string, string> };
};
type SignUpInputTypes =
	| SignUpWithPasswordInput
	| PossibleSignUpPasswordlessInput;

export const isSignUpWithEmailAndMagicLinkInput = (
	input: SignUpInputTypes
): input is SignUpWithEmailAndMagicLinkInput =>
	isSignInWithEmailAndMagicLinkInput(input);

export const isSignUpWithEmailAndOTPInput = (
	input: SignUpInputTypes
): input is SignUpWithEmailAndOTPInput => isSignInWithEmailAndOTPInput(input);

export const isSignUpWithSMSAndOTPInput = (
	input: SignUpInputTypes
): input is SignUpWithSMSAndOTPInput => isSignInWithSMSAndOTPInput(input);

export const assertSignUpWithEmailOptions = (options: {
	userAttributes: Record<string, string>;
}) => {
	assertValidationError(
		!!options.userAttributes.email,
		AuthValidationErrorCode.EmptySignUpEmail
	);
};

export const assertSignUpWithSMSOptions = (options: {
	userAttributes: Record<string, string>;
}) => {
	assertValidationError(
		!!options.userAttributes.phone_number,
		AuthValidationErrorCode.EmptySignUpPhoneNumber
	);
};

type SignInPasswordlessOutputTypes =
	| SignInWithEmailAndMagicLinkOutput
	| SignInWithSMSAndOTPOutput
	| SignInWithEmailAndOTPOutput;
export function convertSignInOutputToSignUpOutput<
	T extends SignInPasswordlessOutputTypes,
>({
	isSignedIn,
	nextStep: nextSignInStep,
}: T): {
	isSignUpComplete: T['isSignedIn'];
	nextStep: T['nextStep'] & { signUpStep: T['nextStep']['signInStep'] };
} {
	return {
		isSignUpComplete: isSignedIn,
		nextStep: {
			...nextSignInStep,
			signUpStep: nextSignInStep.signInStep,
		},
	};
}
