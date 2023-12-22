// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
	AuthVerifiableAttributeKey,
} from '@aws-amplify/core/internals/utils';

import type { confirmSignIn } from './confirmSignIn';
import { AuthDeliveryMedium } from '../../../types';
import { SignUpInput, SignUpOutput, SignInInput } from '../types';
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
	isSignUpPasswordlessWithEmailAndMagicLinkInput,
	isSignUpPasswordlessWithEmailAndOTPInput,
	isSignUpPasswordlessWithSMSAndOTPInput,
} from '../utils/signUpHelpers';
import { setAutoSignIn } from './autoSignIn';
import { getAuthUserAgentValue } from '../../../utils';
import {
	SignUpPasswordlessWithEmailAndMagicLinkInput,
	SignUpPasswordlessWithEmailAndOTPInput,
	SignUpPasswordlessWithSMSAndOTPInput,
	SignUpWithOptionalPasswordInput,
} from '../types/inputs';
import {
	SignUpPasswordlessWithEmailAndMagicLinkOutput,
	SignUpPasswordlessWithEmailAndOTPOutput,
	SignUpPasswordlessWithSMSAndOTPOutput,
} from '../types/outputs';
import { signUpPasswordless } from './signUpPasswordless';

/**
 * Creates a user
 *
 * @param input - The {@link SignUpInput} object
 * @returns - {@link SignUpOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signUp(
	input: SignUpWithOptionalPasswordInput
): Promise<SignUpOutput>;

/**
 * Creates a user with an email address instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the code extracted from the MagicLink delivered to the email
 * address.
 *
 * @param input - The {@link SignUpPasswordlessWithEmailAndMagicLinkInput} object
 * @returns - {@link SignUpPasswordlessWithEmailAndMagicLinkOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signUp(
	input: SignUpPasswordlessWithEmailAndMagicLinkInput
): Promise<SignUpPasswordlessWithEmailAndMagicLinkOutput>;
/**
 * Creates a user with an email address instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the one-time password delivered to the email address.
 *
 * @param input - The {@link SignUpPasswordlessWithSMSAndOTPInput} object
 * @returns - {@link SignUpPasswordlessWithSMSAndOTPOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signUp(
	input: SignUpPasswordlessWithSMSAndOTPInput
): Promise<SignUpPasswordlessWithSMSAndOTPOutput>;
/**
 * Creates a user with a phone number instead of a password, and signs the user in automatically. The sign-up flow is
 * completed by calling the {@link confirmSignIn} API with the the one-time password delivered to the phone number via
 * SMS.
 *
 * @param input - The {@link SignUpPasswordlessWithEmailAndOTPInput} object
 * @returns - {@link SignUpPasswordlessWithEmailAndOTPOutput}
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export function signUp(
	input: SignUpPasswordlessWithEmailAndOTPInput
): Promise<SignUpPasswordlessWithEmailAndOTPOutput>;
/**
 * @internal
 */
export async function signUp(
	input:
		| SignUpPasswordlessWithEmailAndMagicLinkInput
		| SignUpPasswordlessWithSMSAndOTPInput
		| SignUpPasswordlessWithEmailAndOTPInput
		| SignUpWithOptionalPasswordInput
) {
	const { options, passwordless } = input;
	if (passwordless) {
		// Iterate through signUpPasswordless calls to make TypeScript happy
		const { deliveryMedium, method } = passwordless;
		if (isSignUpPasswordlessWithEmailAndMagicLinkInput(input)) {
			return signUpPasswordless(input);
		} else if (isSignUpPasswordlessWithEmailAndOTPInput(input)) {
			return signUpPasswordless(input);
		} else if (isSignUpPasswordlessWithSMSAndOTPInput(input)) {
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
	input: SignUpWithOptionalPasswordInput
): Promise<SignUpOutput> => {
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
