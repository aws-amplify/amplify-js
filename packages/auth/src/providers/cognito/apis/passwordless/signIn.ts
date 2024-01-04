// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { getAuthUserAgentValue } from '../../../../utils';
import { CognitoAuthSignInDetails } from '../../types/models';
import {
	initiateAuth,
	respondToAuthChallenge,
} from '../../utils/clients/CognitoIdentityProvider';
import {
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
} from '../../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';
import {
	getActiveSignInUsername,
	setActiveSignInUsername,
} from '../../utils/signInHelpers';
import { AuthAction } from '@aws-amplify/core/internals/utils';
import { setActiveSignInState } from '../../utils/signInStore';
import {
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndOTPInput,
	SignInWithSMSAndOTPInput,
} from '../../types/inputs';
import {
	SignInWithEmailAndMagicLinkOutput,
	SignInWithEmailAndOTPOutput,
	SignInWithSMSAndOTPOutput,
} from '../../types/outputs';
import {
	KEY_PASSWORDLESS_ACTION,
	KEY_PASSWORDLESS_DELIVERY_MEDIUM,
	KEY_PASSWORDLESS_SIGN_IN_METHOD,
	KEY_PASSWORDLESS_REDIRECT_URI,
	DUMMY_COGNITO_CHALLENGE_ANSWER,
} from './constants';
import {
	validatePasswordlessInput,
	isSignInWithEmailAndMagicLinkInput,
	isSignInWithEmailAndOTPInput,
	isSignInWithSMSAndOTPInput,
} from './utils';

/**
 * @internal
 */
export function signIn(
	input: SignInWithEmailAndMagicLinkInput
): Promise<SignInWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signIn(
	input: SignInWithEmailAndOTPInput
): Promise<SignInWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signIn(
	input: SignInWithSMSAndOTPInput
): Promise<SignInWithSMSAndOTPOutput>;

/**
 * Initiate the passwordless sign-in flow by requesting a code/link to be sent via the delivery medium.
 *
 * Note: It does not re-use the internal {@link handleCustomAuthFlowWithoutSRP} API because the passwordless sign-in flow
 * does not yet support device key or Cognito Advanced Security Features.
 *
 * TODO: check if device key and Cognito Advanced Security Features are supported by the passwordless sign-in flow.
 * If so, we can re-use the internal {@link handleCustomAuthFlowWithoutSRP} API.
 *
 * @internal
 */
export async function signIn(
	input:
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput
) {
	const authConfig = Amplify.getConfig().Auth?.Cognito;

	assertTokenProviderConfig(authConfig);
	validatePasswordlessInput(input, Amplify);

	const { userPoolId, userPoolClientId } = authConfig;
	const {
		username,
		passwordless: { deliveryMedium, method },
		options: { clientMetadata } = {},
	} = input;

	const authParameters: Record<string, string> = {
		USERNAME: username,
	};

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: authParameters,
		ClientId: userPoolClientId,
	};

	// Initiate Auth with a custom flow
	const { Session, ChallengeParameters = {} } = await initiateAuth(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReqInitiateAuth
	);
	const activeUsername = ChallengeParameters?.USERNAME ?? username;

	setActiveSignInUsername(activeUsername);

	const jsonReqRespondToAuthChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: {
			USERNAME: activeUsername,
			ANSWER: DUMMY_COGNITO_CHALLENGE_ANSWER,
		},
		Session,
		ClientMetadata: {
			...clientMetadata,
			[KEY_PASSWORDLESS_SIGN_IN_METHOD]: method,
			[KEY_PASSWORDLESS_ACTION]: 'REQUEST',
			[KEY_PASSWORDLESS_DELIVERY_MEDIUM]: deliveryMedium,
			...(deliveryMedium === 'EMAIL' && {
				[KEY_PASSWORDLESS_REDIRECT_URI]:
					Amplify.libraryOptions.Auth?.magicLinkRedirectURL!,
			}),
		},
		ClientId: userPoolClientId,
	};

	// Request the backend to send code/link to the destination address
	const responseFromAuthChallenge = await respondToAuthChallenge(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		jsonReqRespondToAuthChallenge
	);

	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'CUSTOM_WITHOUT_SRP',
	};

	// sets up local state used during the sign-in process
	setActiveSignInState({
		signInSession: responseFromAuthChallenge.Session,
		username: getActiveSignInUsername(username),
		signInDetails,
		challengeName: 'CUSTOM_CHALLENGE',
		signInMethod: method,
	});

	const responseAdditionalInfo = ChallengeParameters;
	const responseCodeDeliveryDetails = {
		deliveryMedium: ChallengeParameters?.deliveryMedium,
		destination: ChallengeParameters?.destination,
	};
	if (isSignInWithEmailAndMagicLinkInput(input)) {
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
				additionalInfo: responseAdditionalInfo,
				codeDeliveryDetails: responseCodeDeliveryDetails,
			},
		} as SignInWithEmailAndMagicLinkOutput;
	} else if (
		isSignInWithEmailAndOTPInput(input) ||
		isSignInWithSMSAndOTPInput(input)
	) {
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
				additionalInfo: responseAdditionalInfo,
				codeDeliveryDetails: responseCodeDeliveryDetails,
			},
		} as SignInWithSMSAndOTPOutput;
	}
}
