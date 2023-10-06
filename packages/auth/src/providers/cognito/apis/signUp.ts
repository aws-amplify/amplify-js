// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
} from '@aws-amplify/core/internals/utils';
import { AuthDeliveryMedium } from '../../../types';
import {
	UserAttributeKey,
	SignUpInput,
	SignUpOutput,
	SignInInput,
} from '../types';
import { signUp as signUpClient } from '../utils/clients/CognitoIdentityProvider';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { AttributeType } from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import {
	handleCodeAutoSignIn,
	isAutoSignInStarted,
	setAutoSignInStarted,
	isSignUpComplete,
	autoSignInWhenUserIsConfirmed,
	autoSignInWhenUserIsConfirmedWithLink,
} from '../utils/signUpHelpers';
import { setAutoSignIn } from './autoSignIn';
import { getAuthUserAgentValue } from '../../../utils';

/**
 * Creates a user
 *
 * @param input - The SignUpInput object
 * @returns SignUpOutput
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signUp(input: SignUpInput): Promise<SignUpOutput> {
	const { username, password, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signUpVerificationMethod =
		authConfig?.signUpVerificationMethod ?? 'code';
	const clientMetadata = input.options?.serviceOptions?.clientMetadata;
	assertTokenProviderConfig(authConfig);
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignUpPassword
	);

	let validationData: AttributeType[] | undefined;
	let attributes: AttributeType[] | undefined;

	if (options?.serviceOptions?.validationData) {
		validationData = toAttributeType(options?.serviceOptions?.validationData);
	}
	if (options?.userAttributes) {
		attributes = toAttributeType(options?.userAttributes);
	}
	const signInServiceOptions = options?.serviceOptions?.autoSignIn;

	const signInInput: SignInInput = {
		username,
		password,
		options: {
			serviceOptions:
				typeof signInServiceOptions !== 'boolean'
					? signInServiceOptions
					: undefined,
		},
	};
	if (signInServiceOptions) {
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
			UserAttributes: attributes,
			ClientMetadata: clientMetadata,
			ValidationData: validationData,
			ClientId: authConfig.userPoolClientId,
		}
	);
	const { UserSub, CodeDeliveryDetails } = clientOutput;

	if (isSignUpComplete(clientOutput) && isAutoSignInStarted()) {
		setAutoSignIn(autoSignInWhenUserIsConfirmed(signInInput));
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'AUTO_SIGN_IN',
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
				signUpStep: 'AUTO_SIGN_IN',
				codeDeliveryDetails: {
					deliveryMedium:
						CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
					destination: CodeDeliveryDetails?.Destination as string,
					attributeName: CodeDeliveryDetails?.AttributeName as UserAttributeKey,
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
				attributeName: CodeDeliveryDetails?.AttributeName as UserAttributeKey,
			},
		},
		userId: UserSub,
	};
}
