// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';

import { SignInInput, SignInOptions, SignInOutput } from '../types';
import {
	SignInInputWithOptionalPassword,
	SignInWithEmailInput,
	SignInWithSMSInput,
} from '../types/inputs';
import { SignInWithEmailOutput, SignInWithSMSOutput } from '../types/outputs';

type SignInApi = {
	/**
	 * Signs a user in
	 *
	 * @param input -  The SignInInput object
	 * @returns SignInOutput
	 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
	 *  - Cognito service errors thrown during the sign-in process.
	 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
	 *  are not defined.
	 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
	 */
	(input: SignInInputWithOptionalPassword): Promise<SignInOutput>;

	(input: SignInWithEmailInput<'OTP'>): Promise<SignInWithEmailOutput<'OTP'>>;

	(input: SignInWithSMSInput): Promise<SignInWithSMSOutput>;

	(
		input: SignInWithEmailInput<'MAGIC_LINK'>
	): Promise<SignInWithEmailOutput<'MAGIC_LINK'>>;
};

/**
 * Signs a user in
 *
 * @param input -  The SignInInput object
 * @returns SignInOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const signIn: SignInApi = async (
	input:
		| SignInInput
		| SignInWithSMSInput
		| SignInWithEmailInput<'MAGIC_LINK' | 'OTP'>
): Promise<{ isSignedIn: boolean; nextStep: any }> => {
	// export async function signIn(input: SignInInput): Promise<SignInOutput> {
	const passwordlessConnection = input.passwordlessConnection;
	const passwordlessMethod = input.options?.passwordlessMethod;
	await assertUserNotAuthenticated();
	// if ((passwordlessConnection === 'EMAIL' || input.passwordlessConnection === 'SMS') && input.options?)
	switch (passwordlessMethod) {
		case 'MAGIC_LINK':
			// TODO: needs implementation
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
					additionalInfo: {},
					codeDeliveryDetails: {},
				},
			} as any;
		case 'OTP':
			// TODO: needs implementation
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					additionalInfo: {},
					codeDeliveryDetails: {},
				},
			} as any;
		default:
			const authFlowType = input.options?.authFlowType;
			const username = input.username;
			const password = input.password;
			const options = input.options as SignInOptions;
			switch (authFlowType) {
				case 'USER_SRP_AUTH':
					return signInWithSRP({
						username,
						password,
						options,
					});
				case 'USER_PASSWORD_AUTH':
					return signInWithUserPassword({
						username,
						password,
						options,
					});
				case 'CUSTOM_WITHOUT_SRP':
					return signInWithCustomAuth({
						username,
						password,
						options,
					});
				case 'CUSTOM_WITH_SRP':
					return signInWithCustomSRPAuth({
						username,
						password,
						options,
					});
				default:
					return signInWithSRP({
						username,
						password,
						options,
					});
			}
	}
};
