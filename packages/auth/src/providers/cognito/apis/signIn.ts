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

import { SignInInput, SignInOutput } from '../types';
import { SignInWithMagicLinkInput, SignInWithOTPInput } from '../types/inputs';
import {
	SignInWithMagicLinkOutput,
	SignInWithOTPOutput,
} from '../types/outputs';

// type SignInApi = {
// 	/**
// 	 * Signs a user in
// 	 *
// 	 * @param input -  The SignInInput object
// 	 * @returns SignInOutput
// 	 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
// 	 *  - Cognito service errors thrown during the sign-in process.
// 	 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
// 	 *  are not defined.
// 	 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
// 	 */
// 	(intput: SignInInput): Promise<SignInOutput>;

// 	(intput: SignInWithMagicLinkInput): Promise<SignInWithMagicLinkOutput>;

// 	(input: SignInWithOTPInput): Promise<SignInWithOTPOutput>;
// };

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
// export const signIn: SignInApi = async (
// 	input: SignInInput | SignInWithMagicLinkInput | SignInWithOTPInput
// ): Promise<any> => {
export async function signIn(input: SignInInput): Promise<SignInOutput> {
	const passwordlessFlow = input.passwordlessFlow;
	const authFlowType = input.options?.authFlowType;
	await assertUserNotAuthenticated();
	switch (passwordlessFlow) {
		case 'MAGIC_LINK':
			// TODO: needs implementation
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
					additionalInfo: {},
					codeDeliveryDetails: {},
				},
			};
		case 'OTP':
			// TODO: needs implementation
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					additionalInfo: {},
					codeDeliveryDetails: {},
				},
			};
		default:
			switch (authFlowType) {
				case 'USER_SRP_AUTH':
					return signInWithSRP(input);
				case 'USER_PASSWORD_AUTH':
					return signInWithUserPassword(input);
				case 'CUSTOM_WITHOUT_SRP':
					return signInWithCustomAuth(input);
				case 'CUSTOM_WITH_SRP':
					return signInWithCustomSRPAuth(input);
				default:
					return signInWithSRP(input);
			}
	}
}
