// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
	AuthVerifiableAttributeKey,
} from '@aws-amplify/core/internals/utils';

import { AuthDeliveryMedium } from '../../../types';
import { SignInInput } from '../types';
import { signUp as signUpClient } from '../utils/clients/CognitoIdentityProvider';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import {
	handleCodeAutoSignIn,
	isAutoSignInStarted,
	setAutoSignInStarted,
	isSignUpComplete,
	autoSignInUserConfirmed,
	autoSignInWhenUserIsConfirmedWithLink,
	setUsernameUsedForAutoSignIn,
} from '../utils/signUpHelpers';
import { setAutoSignIn } from './autoSignIn';
import { getAuthUserAgentValue } from '../../../utils';
import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithPasswordInput,
	SignUpWithSMSAndOTPInput,
} from '../types/inputs';
import {
	SignUpWithEmailAndMagicLinkOutput,
	SignUpWithEmailAndOTPOutput,
	SignUpWithPasswordOutput,
	SignUpWithSMSAndOTPOutput,
} from '../types/outputs';
import {
	signUpPasswordless,
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
	isSignUpWithSMSAndOTPInput,
	assertSignUpWithEmailOptions,
	assertSignUpWithSMSOptions,
} from './passwordless';

import type { confirmSignIn } from './confirmSignIn';

/**
 * Creates a user
 *
 * @param input - The {@link SignUpWithPasswordInput} object
 * @returns The {@link SignUpWithPasswordOutput} object
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws AuthValidationErrorCode when `username` or `password` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signUp(
	input: SignUpWithPasswordInput
): Promise<SignUpWithPasswordOutput>;

/**
 * Creates a user with an email address instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the code extracted from the MagicLink delivered to the email
 * address.
 *
 * @param input - The {@link SignUpWithEmailAndMagicLinkInput} object
 * @returns - {@link SignUpWithEmailAndMagicLinkOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 *   see {@link AuthValidationErrorCode}
 */
export function signUp(
	input: SignUpWithEmailAndMagicLinkInput
): Promise<SignUpWithEmailAndMagicLinkOutput>;
/**
 * Creates a user with an email address instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the one-time password delivered to the email address.
 *
 * @param input - The {@link SignUpWithSMSAndOTPInput} object
 * @returns - {@link SignUpWithSMSAndOTPOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signUp(
	input: SignUpWithSMSAndOTPInput
): Promise<SignUpWithSMSAndOTPOutput>;
/**
 * Creates a user with a phone number instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the the one-time password delivered to the phone number via
 * SMS.
 *
 * @param input - The {@link SignUpWithEmailAndOTPInput} object
 * @returns - {@link SignUpWithEmailAndOTPOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws AuthValidationErrorCode when `username` or `passwordless` is invalid.
 *   see {@link AuthValidationErrorCode}
 * @throws AuthTokenConfigException when the token provider config is invalid.
 */
export function signUp(
	input: SignUpWithEmailAndOTPInput
): Promise<SignUpWithEmailAndOTPOutput>;

/**
 * @internal
 */
export async function signUp(
	input:
		| SignUpWithPasswordInput
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) {
	const { passwordless } = input;
	if (passwordless) {
		// Iterate through signUpPasswordless calls to make TypeScript happy
		if (isSignUpWithEmailAndMagicLinkInput(input)) {
			assertSignUpWithEmailOptions(input.options);
			return signUpPasswordless(input);
		} else if (isSignUpWithEmailAndOTPInput(input)) {
			assertSignUpWithEmailOptions(input.options);
			return signUpPasswordless(input);
		} else if (isSignUpWithSMSAndOTPInput(input)) {
			assertSignUpWithSMSOptions(input.options);
			return signUpPasswordless(input);
		} else {
			// TODO: implement validation error
			throw new Error('SMS does not support MagicLink');
		}
	} else {
		return signUpWithPassword(input);
	}
}

const signUpWithPassword = async (
	input: SignUpWithPasswordInput
): Promise<SignUpWithPasswordOutput> => {
	const { username, password, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signUpVerificationMethod =
		authConfig?.signUpVerificationMethod ?? 'code';
	const { clientMetadata, validationData, autoSignIn } = input.options ?? {};
	assertTokenProviderConfig(authConfig);
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignUpPassword
	);

	const signInServiceOptions =
		typeof autoSignIn !== 'boolean' ? autoSignIn : undefined;

	const signInInput: SignInInput = {
		username,
		options: signInServiceOptions,
	};

	// if the authFlowType is 'CUSTOM_WITHOUT_SRP' then we don't include the password
	if (signInServiceOptions?.authFlowType !== 'CUSTOM_WITHOUT_SRP') {
		signInInput['password'] = password;
	}
	if (signInServiceOptions || autoSignIn === true) {
		setUsernameUsedForAutoSignIn(username);
		setAutoSignInStarted(true);
	}
	const clientOutput = await signUpClient(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignUp),
		},
		{
			Username: username,
			Password: password,
			UserAttributes:
				options?.userAttributes && toAttributeType(options?.userAttributes),
			ClientMetadata: clientMetadata,
			ValidationData: validationData && toAttributeType(validationData),
			ClientId: authConfig.userPoolClientId,
		}
	);
	const { UserSub, CodeDeliveryDetails } = clientOutput;

	if (isSignUpComplete(clientOutput) && isAutoSignInStarted()) {
		setAutoSignIn(autoSignInUserConfirmed(signInInput));
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'COMPLETE_AUTO_SIGN_IN',
			},
		};
	} else if (isSignUpComplete(clientOutput) && !isAutoSignInStarted()) {
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
			},
		};
	} else if (
		!isSignUpComplete(clientOutput) &&
		isAutoSignInStarted() &&
		signUpVerificationMethod === 'code'
	) {
		handleCodeAutoSignIn(signInInput);
	} else if (
		!isSignUpComplete(clientOutput) &&
		isAutoSignInStarted() &&
		signUpVerificationMethod === 'link'
	) {
		setAutoSignIn(autoSignInWhenUserIsConfirmedWithLink(signInInput));
		return {
			isSignUpComplete: false,
			nextStep: {
				signUpStep: 'COMPLETE_AUTO_SIGN_IN',
				codeDeliveryDetails: {
					deliveryMedium:
						CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
					destination: CodeDeliveryDetails?.Destination as string,
					attributeName:
						CodeDeliveryDetails?.AttributeName as AuthVerifiableAttributeKey,
				},
			},
			userId: UserSub,
		};
	}

	return {
		isSignUpComplete: false,
		nextStep: {
			signUpStep: 'CONFIRM_SIGN_UP',
			codeDeliveryDetails: {
				deliveryMedium:
					CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
				destination: CodeDeliveryDetails?.Destination as string,
				attributeName:
					CodeDeliveryDetails?.AttributeName as AuthVerifiableAttributeKey,
			},
		},
		userId: UserSub,
	};
};
