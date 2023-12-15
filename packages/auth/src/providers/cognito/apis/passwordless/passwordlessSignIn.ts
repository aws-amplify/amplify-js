// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAuthUserAgentValue } from "../../../../utils";
import { CognitoAuthSignInDetails } from "../../types/models";
import { initiateAuth, respondToAuthChallenge } from "../../utils/clients/CognitoIdentityProvider";
import { InitiateAuthCommandInput, RespondToAuthChallengeCommandInput } from "../../utils/clients/CognitoIdentityProvider/types";
import { getRegion } from "../../utils/clients/CognitoIdentityProvider/utils";
import { getActiveSignInUsername, setActiveSignInUsername } from "../../utils/signInHelpers";
import {  AuthConfig } from '@aws-amplify/core';
import {
	AuthAction
} from '@aws-amplify/core/internals/utils';
import { getDeliveryMedium } from "./utils";
import { setActiveSignInState } from "../../utils/signInStore";
import { PasswordlessSignInPayload } from "./types";

/**
 * Internal method to perform passwordless sign in via both otp and magic link.
 */
export async function handlePasswordlessSignIn(
	payload: PasswordlessSignInPayload,
	authConfig: AuthConfig['Cognito']
) {
	const { userPoolId, userPoolClientId } = authConfig;
	const { username, clientMetadata, destination, signInMethod } = payload;
	const authParameters: Record<string, string> = {
		USERNAME: username,
	};

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: authParameters,
		ClientId: userPoolClientId,
	};

	// Intiate Auth with a custom flow
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
			'Amplify.Passwordless.signInMethod': signInMethod,
			'Amplify.Passwordless.action': 'REQUEST',
			'Amplify.Passwordless.deliveryMedium': getDeliveryMedium(destination),
		},
		ClientId: userPoolClientId,
	};

	// Request the backend to send code/link to the destination address
	const responseFromAuthChallenge =  await respondToAuthChallenge(
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
	
	return responseFromAuthChallenge;
}



