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

type SignInPasswordlessApi = {
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
 * @internal
 */
export const signInPasswordless: SignInPasswordlessApi = async input => {
	// TODO: needs implementation
	return {} as any;
};
