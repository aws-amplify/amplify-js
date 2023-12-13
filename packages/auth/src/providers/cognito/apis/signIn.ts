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
// 	(intput: SignInInputWithOptionalPassword): Promise<SignInOutput>;

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
export const signIn: <
	Input extends SignInWithMagicLinkInput | SignInWithOTPInput | SignInInput,
>(
	input: Input
) => Promise<
	Input extends SignInWithMagicLinkInput
		? SignInWithMagicLinkOutput
		: Input extends SignInWithOTPInput
		  ? SignInWithOTPOutput
		  : SignInOutput
> = async input => {
	await assertUserNotAuthenticated();
	if (isMagicLinkInput(input)) {
		// TODO: needs implementation
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
				additionalInfo: {},
				codeDeliveryDetails: {},
			},
		} as SignInWithMagicLinkOutput;
	} else if (isOTPInput(input)) {
		// TODO: needs implementation
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
				additionalInfo: {},
				codeDeliveryDetails: {},
			},
		} as SignInWithOTPOutput;
	} else if (isInputWithOptionalPassword(input)) {
		switch (input.options?.authFlowType) {
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
};
// => {
// 	// export async function signIn(input: SignInInput): Promise<SignInOutput> {
// 	const passwordlessFlow = input.passwordlessFlow;
// 	const authFlowType = input.options?.authFlowType;
// 	await assertUserNotAuthenticated();
// 	if (isMagicLinkInput(input)) {
// 		return {
// 			isSignedIn: false,
// 			nextStep: {
// 				signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
// 				additionalInfo: {},
// 				codeDeliveryDetails: {},
// 			},
// 		} as SignInWithMagicLinkOutput;
// 	}
// 	// switch (passwordlessFlow) {
// 	// 	case 'MAGIC_LINK':
// 	// 		// TODO: needs implementation
// 	// 		return {
// 	// 			isSignedIn: false,
// 	// 			nextStep: {
// 	// 				signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
// 	// 				additionalInfo: {},
// 	// 				codeDeliveryDetails: {},
// 	// 			},
// 	// 		} as SignInWithMagicLinkOutput;
// 	// 	case 'OTP':
// 	// 		// TODO: needs implementation
// 	// 		return {
// 	// 			isSignedIn: false,
// 	// 			nextStep: {
// 	// 				signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
// 	// 				additionalInfo: {},
// 	// 				codeDeliveryDetails: {},
// 	// 			},
// 	// 		} as any;
// 	// 	default:
// 	// 		switch (authFlowType) {
// 	// 			case 'USER_SRP_AUTH':
// 	// 				return signInWithSRP(input);
// 	// 			case 'USER_PASSWORD_AUTH':
// 	// 				return signInWithUserPassword(input);
// 	// 			case 'CUSTOM_WITHOUT_SRP':
// 	// 				return signInWithCustomAuth(input);
// 	// 			case 'CUSTOM_WITH_SRP':
// 	// 				return signInWithCustomSRPAuth(input);
// 	// 			default:
// 	// 				return signInWithSRP(input);
// 	// 		}
// 	// }
// };

const isInputWithOptionalPassword = (
	input: SignInInput | SignInWithMagicLinkInput | SignInWithOTPInput
): input is SignInInput => input.passwordlessFlow === undefined;

const isMagicLinkInput = (
	input: SignInInput | SignInWithMagicLinkInput | SignInWithOTPInput
): input is SignInWithMagicLinkInput => input.passwordlessFlow === 'MAGIC_LINK';

const isOTPInput = (
	input: SignInInput | SignInWithMagicLinkInput | SignInWithOTPInput
): input is SignInWithOTPInput => input.passwordlessFlow === 'OTP';
