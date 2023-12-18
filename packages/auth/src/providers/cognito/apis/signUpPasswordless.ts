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

type SignUpPasswordlessApi = {
	(
		input: SignUpPasswordlessWithEmailAndMagicLinkInput
	): Promise<SignUpPasswordlessWithEmailAndMagicLinkOutput>;

	(
		input: SignUpPasswordlessWithEmailAndOTPInput
	): Promise<SignUpPasswordlessWithEmailAndOTPOutput>;

	(
		input: SignUpPasswordlessWithSMSAndOTPInput
	): Promise<SignUpPasswordlessWithSMSAndOTPOutput>;
};

/**
 * @internal
 */
export const signUpPasswordless: SignUpPasswordlessApi = async input => {
	// TODO: needs implementation
	return {} as any;
};
