// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignUpWithEmailAndMagicLinkOutput,
	SignUpWithEmailAndOTPOutput,
	SignUpWithSMSAndOTPOutput,
} from '../types/outputs';

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithEmailAndMagicLinkInput
): Promise<SignUpWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithEmailAndOTPInput
): Promise<SignUpWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithSMSAndOTPInput
): Promise<SignUpWithSMSAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) {
	// TODO: needs implementation
	return {} as any;
}
