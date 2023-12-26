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

import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../../errors/types/validation';
import {
	KEY_PASSWORDLESS_ACTION,
	KEY_PASSWORDLESS_DELIVERY_MEDIUM,
	KEY_PASSWORDLESS_SIGN_IN_METHOD,
} from './constants';

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithEmailAndMagicLinkInput
): Promise<SignInWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithEmailAndOTPInput
): Promise<SignInWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signInPasswordless(
	input: SignInWithSMSAndOTPInput
): Promise<SignInWithSMSAndOTPOutput>;

/**
 * @internal
 */
export async function signInPasswordless(
	input:
		| SignInWithEmailAndMagicLinkInput
		| SignInWithEmailAndOTPInput
		| SignInWithSMSAndOTPInput
) {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolId, userPoolClientId } = authConfig;
	const {
		username,
		passwordless: { deliveryMedium, method },
		password,
		options: { clientMetadata } = {},
	} = input;

	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);
	assertValidationError(
		!password,
		AuthValidationErrorCode.PasswordlessSignInHasPassword
	);
	assertValidationError(
		(deliveryMedium === 'EMAIL' && ['MAGIC_LINK', 'OTP'].includes(method)) ||
			(deliveryMedium === 'SMS' && method === 'OTP'),
		AuthValidationErrorCode.IncorrectPasswordlessMethod
	);
	// TODO: validate passwordless deliveryMedium to be EMAIL or SMS when method is OTP
	// TODO: validate passwordless deliveryMedium to be EMAIL when method is MAGIC_LINK

	const authParameters: Record<string, string> = {
		USERNAME: username,
	};

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: authParameters,
		ClientId: userPoolClientId,
	};

	// Initiate Auth with a custom flow
	const { Session, ChallengeParameters } = await initiateAuth(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReqInitiateAuth
	);
	const activeUsername = ChallengeParameters?.USERNAME ?? username;

	setActiveSignInUsername(activeUsername);

	// The answer is not used by the service. It is just a placeholder to make the request happy.
	const dummyAnswer = 'dummyAnswer';
	const jsonReqRespondToAuthChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'CUSTOM_CHALLENGE',
		ChallengeResponses: {
			USERNAME: activeUsername,
			ANSWER: dummyAnswer,
		},
		Session,
		ClientMetadata: {
			...clientMetadata,
			[KEY_PASSWORDLESS_SIGN_IN_METHOD]: method,
			[KEY_PASSWORDLESS_ACTION]: 'REQUEST',
			[KEY_PASSWORDLESS_DELIVERY_MEDIUM]: deliveryMedium,
			...(deliveryMedium === 'EMAIL' && {}),
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
	});

	return {
		isSignedIn: false,
		nextStep: {
			signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
			additionalInfo: ChallengeParameters as AuthAdditionalInfo,
			codeDeliveryDetails: {
				deliveryMedium:
					ChallengeParameters?.deliveryMedium as AuthDeliveryMedium,
				destination: ChallengeParameters?.destination,
			},
		},
	};
}
