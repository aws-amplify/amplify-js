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
import {
	SignInInputWithOptionalPassword,
	SignInWithMagicLinkInput,
	SignInWithOTPInput,
} from '../types/inputs';
import {
	SignInWithMagicLinkOutput,
	SignInWithOTPOutput,
	SignInWithSRPOutput,
} from '../types/outputs';

type SignInApi = <
	T extends
		| SignInInputWithOptionalPassword
		| SignInWithMagicLinkInput
		| SignInWithOTPInput,
>(
	input: T
) => Promise<
	T['options'] extends { authFlowType: 'AMPLIFY_PASSWORDLESS_OTP' }
		? SignInWithOTPOutput
		: T['options'] extends { authFlowType: 'AMPLIFY_PASSWORDLESS_MAGIC_LINK' }
		  ? SignInWithMagicLinkOutput
		  : SignInOutput
>;

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
export const signIn: SignInApi = async ({ username, password, options }) => {
	// export async function signIn(input: SignInInput): Promise<SignInOutput> {
	const authFlowType = options?.authFlowType;
	await assertUserNotAuthenticated();
	switch (authFlowType) {
		case 'USER_SRP_AUTH':
			return signInWithSRP({ username, password, options }) as any;
		case 'USER_PASSWORD_AUTH':
			return signInWithUserPassword({ username, password, options }) as any;
		case 'CUSTOM_WITHOUT_SRP':
			return signInWithCustomAuth({ username, options }) as any;
		case 'CUSTOM_WITH_SRP':
			return signInWithCustomSRPAuth({ username, password, options }) as any;
		case 'AMPLIFY_PASSWORDLESS_MAGIC_LINK':
			// TODO: needs implementation
			return {
				isSignedIn: false,
				nextStep: {
					signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
					additionalInfo: {},
					codeDeliveryDetails: {},
				},
			} as any;
		case 'AMPLIFY_PASSWORDLESS_OTP':
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
			return signInWithSRP({ username, password, options }) as any;
	}
};
