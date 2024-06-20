// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	AuthVerifiableAttributeKey,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthDeliveryMedium } from '../../../types';
import { SignInInput, SignUpInput, SignUpOutput } from '../types';
import { signUp as signUpClient } from '../utils/clients/CognitoIdentityProvider';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import {
	autoSignInUserConfirmed,
	autoSignInWhenUserIsConfirmedWithLink,
	handleCodeAutoSignIn,
	isAutoSignInStarted,
	isSignUpComplete,
	setAutoSignInStarted,
	setUsernameUsedForAutoSignIn,
} from '../utils/signUpHelpers';
import { getUserContextData } from '../utils/userContextData';
import { getAuthUserAgentValue } from '../../../utils';

import { setAutoSignIn } from './autoSignIn';

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
	const { clientMetadata, validationData, autoSignIn } = input.options ?? {};
	assertTokenProviderConfig(authConfig);
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername,
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignUpPassword,
	);

	const signInServiceOptions =
		typeof autoSignIn !== 'boolean' ? autoSignIn : undefined;

	const signInInput: SignInInput = {
		username,
		options: signInServiceOptions,
	};
	// if the authFlowType is 'CUSTOM_WITHOUT_SRP' then we don't include the password
	if (signInServiceOptions?.authFlowType !== 'CUSTOM_WITHOUT_SRP') {
		signInInput.password = password;
	}
	if (signInServiceOptions || autoSignIn === true) {
		setUsernameUsedForAutoSignIn(username);
		setAutoSignInStarted(true);
	}

	const { userPoolId, userPoolClientId } = authConfig;

	const clientOutput = await signUpClient(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignUp),
		},
		{
			Username: username,
			Password: password,
			UserAttributes:
				options?.userAttributes && toAttributeType(options?.userAttributes),
			ClientMetadata: clientMetadata,
			ValidationData: validationData && toAttributeType(validationData),
			ClientId: userPoolClientId,
			UserContextData: getUserContextData({
				username,
				userPoolId,
				userPoolClientId,
			}),
		},
	);
	const { UserSub, CodeDeliveryDetails } = clientOutput;

	if (isSignUpComplete(clientOutput) && isAutoSignInStarted()) {
		setAutoSignIn(autoSignInUserConfirmed(signInInput));

		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'COMPLETE_AUTO_SIGN_IN',
			},
			userId: UserSub,
		};
	} else if (isSignUpComplete(clientOutput) && !isAutoSignInStarted()) {
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
			},
			userId: UserSub,
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
}
