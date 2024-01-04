// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AmplifyUrl,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithSMSAndOTPInput,
} from '../../types/inputs';
import {
	SignUpWithEmailAndMagicLinkOutput,
	SignUpWithEmailAndOTPOutput,
	SignUpWithSMSAndOTPOutput,
} from '../../types/outputs';
import { createUser } from './createUser';
import {
	convertSignInOutputToSignUpOutput,
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
} from './utils';
import { signIn as signInPasswordless } from './signIn';

/**
 * @internal
 */
export function signUp(
	input: SignUpWithEmailAndMagicLinkInput
): Promise<SignUpWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signUp(
	input: SignUpWithEmailAndOTPInput
): Promise<SignUpWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signUp(
	input: SignUpWithSMSAndOTPInput
): Promise<SignUpWithSMSAndOTPOutput>;

/**
 * @internal
 */
export async function signUp(
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) {
	const authConfig = Amplify.getConfig().Auth?.Cognito;

	assertTokenProviderConfig(authConfig);
	const userPoolId = authConfig.userPoolId;

	// TODO: support resolving create user handler endpoint from Amplify config when design is finalized.
	const createUserHandlerEndpoint = new AmplifyUrl('');
	const response = await createUser(
		createUserHandlerEndpoint,
		userPoolId,
		input
	);

	/**
	 * Passwordless sign up always triggers a sign in. The sign-up is completed by the delivery medium is verified
	 * in the sign in step. Otherwise, the temporary user is invalidated after the a given expiration configured
	 * in the backend.
	 *
	 * Iterate through the overload signatures to make TypeScript happy.
	 * The returns needs cast to satisfy the overload signature.
	 */
	if (isSignUpWithEmailAndMagicLinkInput(input)) {
		const signInOutput = await signInPasswordless(input);
		return convertSignInOutputToSignUpOutput(
			signInOutput
		) satisfies SignUpWithEmailAndMagicLinkOutput as SignUpWithEmailAndMagicLinkOutput;
	} else if (isSignUpWithEmailAndOTPInput(input)) {
		const signInOutput = await signInPasswordless(input);
		return convertSignInOutputToSignUpOutput(
			signInOutput
		) satisfies SignUpWithEmailAndOTPOutput as SignUpWithEmailAndOTPOutput;
	} else {
		const signInOutput = await signInPasswordless(input);
		return convertSignInOutputToSignUpOutput(
			signInOutput
		) satisfies SignUpWithSMSAndOTPOutput as SignUpWithSMSAndOTPOutput;
	}
}
