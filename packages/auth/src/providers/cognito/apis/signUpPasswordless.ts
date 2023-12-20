// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SignUpPasswordlessWithEmailAndMagicLinkInput,
	SignUpPasswordlessWithEmailAndOTPInput,
	SignUpPasswordlessWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignUpPasswordlessWithEmailAndMagicLinkOutput,
	SignUpPasswordlessWithEmailAndOTPOutput,
	SignUpPasswordlessWithSMSAndOTPOutput,
} from '../types/outputs';

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpPasswordlessWithEmailAndMagicLinkInput
): Promise<SignUpPasswordlessWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpPasswordlessWithEmailAndOTPInput
): Promise<SignUpPasswordlessWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpPasswordlessWithSMSAndOTPInput
): Promise<SignUpPasswordlessWithSMSAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input:
		| SignUpPasswordlessWithEmailAndMagicLinkInput
		| SignUpPasswordlessWithEmailAndOTPInput
		| SignUpPasswordlessWithSMSAndOTPInput
) {
	// TODO: needs implementation
	return {} as any;
}
