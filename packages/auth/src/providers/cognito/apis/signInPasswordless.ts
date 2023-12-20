// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
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
 * @internal
 */
export function signInPasswordless(
	input: SignInPasswordlessWithEmailAndMagicLinkInput
): Promise<SignInPasswordlessWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInPasswordlessWithEmailAndOTPInput
): Promise<SignInPasswordlessWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInPasswordlessWithSMSAndOTPInput
): Promise<SignInPasswordlessWithSMSAndOTPOutput>;

/**
 * @internal
 */
export async function signInPasswordless(
	input:
		| SignInPasswordlessWithEmailAndMagicLinkInput
		| SignInPasswordlessWithEmailAndOTPInput
		| SignInPasswordlessWithSMSAndOTPInput
) {
	// TODO: needs implementation
	return {} as any;
}
