// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndOTPInput,
	SignInWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignInWithEmailAndMagicLinkOutput,
	SignInWithEmailAndOTPOutput,
	SignInWithSMSAndOTPOutput,
} from '../types/outputs';

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithEmailAndMagicLinkInput
): Promise<SignInWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithEmailAndOTPInput
): Promise<SignInWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithSMSAndOTPInput
): Promise<SignInWithSMSAndOTPOutput>;

/**
 * @internal
 */
export async function signInPasswordless(
	input:
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput
) {
	// TODO: needs implementation
	return {} as any;
}
