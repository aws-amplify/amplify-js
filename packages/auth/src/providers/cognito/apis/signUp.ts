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
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { toAttributeType } from '../utils/apiHelpers';
import {
	autoSignInUserConfirmed,
	autoSignInWhenUserIsConfirmedWithLink,
	handleCodeAutoSignIn,
} from '../utils/signUpHelpers';
import { getUserContextData } from '../utils/userContextData';
import { getAuthUserAgentValue } from '../../../utils';
import { createSignUpClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import { SignUpCommandInput } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { autoSignInStore } from '../../../client/utils/store';

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

	const { userPoolId, userPoolClientId, userPoolEndpoint } = authConfig;
	const signUpClient = createSignUpClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const signUpClientInput: SignUpCommandInput = {
		Username: username,
		Password: undefined,
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
	};

	if (password) {
		signUpClientInput.Password = password;
	}

	const {
		UserSub: userId,
		CodeDeliveryDetails: cdd,
		UserConfirmed: userConfirmed,
		Session: session,
	} = await signUpClient(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignUp),
		},
		signUpClientInput,
	);

	if (signInServiceOptions || autoSignIn === true) {
		autoSignInStore.dispatch({ type: 'START' });
		autoSignInStore.dispatch({ type: 'SET_USERNAME', value: username });
		autoSignInStore.dispatch({ type: 'SET_SESSION', value: session });
	}

	const codeDeliveryDetails = {
		destination: cdd?.Destination,
		deliveryMedium: cdd?.DeliveryMedium as AuthDeliveryMedium,
		attributeName: cdd?.AttributeName as AuthVerifiableAttributeKey,
	};

	const isSignUpComplete = !!userConfirmed;
	const isAutoSignInStarted = autoSignInStore.getState().active;

	// Sign Up Complete
	// No Confirm Sign In Step Required
	if (isSignUpComplete) {
		if (isAutoSignInStarted) {
			setAutoSignIn(autoSignInUserConfirmed(signInInput));

			return {
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'COMPLETE_AUTO_SIGN_IN',
				},
				userId,
			};
		}

		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
			},
			userId,
		};
	}

	// Sign Up Not Complete
	// Confirm Sign Up Step Required
	if (isAutoSignInStarted) {
		// Confirmation Via Link Occurs In Separate Context
		// AutoSignIn Fn Will Initiate Polling Once Executed
		if (signUpVerificationMethod === 'link') {
			setAutoSignIn(autoSignInWhenUserIsConfirmedWithLink(signInInput));

			return {
				isSignUpComplete: false,
				nextStep: {
					signUpStep: 'COMPLETE_AUTO_SIGN_IN',
					codeDeliveryDetails,
				},
				userId,
			};
		}
		// Confirmation Via Code Occurs In Same Context
		// AutoSignIn Next Step Will Be Returned From Confirm Sign Up
		handleCodeAutoSignIn(signInInput);
	}

	return {
		isSignUpComplete: false,
		nextStep: {
			signUpStep: 'CONFIRM_SIGN_UP',
			codeDeliveryDetails,
		},
		userId,
	};
}
