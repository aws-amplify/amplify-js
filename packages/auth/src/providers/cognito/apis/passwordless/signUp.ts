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
import { signInPasswordless } from './signIn';
import {
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
	isSignUpWithSMSAndOTPInput,
} from '../../utils/signUpHelpers';

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
export async function signUpPasswordless(
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) {
	const authConfig = Amplify.getConfig().Auth?.Cognito;

	assertTokenProviderConfig(authConfig);
	const userPoolId = authConfig.userPoolId;
	const {
		username,
		passwordless: { deliveryMedium, method },
		options: { userAttributes, clientMetadata, validationData },
	} = input;

	// TODO: support resolving create user handler endpoint from Amplify config
	const createUserHandlerEndpoint = new AmplifyUrl('');
	const response = await createUser(
		createUserHandlerEndpoint,
		userPoolId,
		input
	);

	console.log('response: ', response);

	// Iterate through the overload signatures to make TypeScript happy.
	if (isSignUpWithEmailAndMagicLinkInput(input)) {
		const { isSignedIn, nextStep: nextSignInStep } =
			await signInPasswordless(input);
		return {
			isSignUpComplete: isSignedIn,
			nextStep: {
				...nextSignInStep,
				signUpStep: nextSignInStep.signInStep,
			},
		} as SignUpWithEmailAndMagicLinkOutput;
	} else if (isSignUpWithEmailAndOTPInput(input)) {
		const { isSignedIn, nextStep: nextSignInStep } =
			await signInPasswordless(input);
		return {
			isSignUpComplete: isSignedIn,
			nextStep: {
				...nextSignInStep,
				signUpStep: nextSignInStep.signInStep,
			},
		} as SignUpWithEmailAndOTPOutput;
	} else if (isSignUpWithSMSAndOTPInput(input)) {
		const { isSignedIn, nextStep: nextSignInStep } =
			await signInPasswordless(input);
		return {
			isSignUpComplete: isSignedIn,
			nextStep: {
				...nextSignInStep,
				signUpStep: nextSignInStep.signInStep,
			},
		} as SignUpWithSMSAndOTPOutput;
	} else {
		// Not possible to reach this branch, but TypeScript doesn't know that.
		throw new Error('Invalid input');
	}
}
