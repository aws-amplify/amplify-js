// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAuthUserAgentValue } from "../../../../utils";
import { SignInWithOTPInput } from "../../types/inputs";
import { AuthPasswordlessDeliveryDestination } from "../../types/models";
import { initiateAuth, respondToAuthChallenge } from "../../utils/clients/CognitoIdentityProvider";
import { InitiateAuthCommandInput, RespondToAuthChallengeCommandInput } from "../../utils/clients/CognitoIdentityProvider/types";
import { getRegion } from "../../utils/clients/CognitoIdentityProvider/utils";
import { setActiveSignInUsername } from "../../utils/signInHelpers";
import {  AuthConfig } from '@aws-amplify/core';
import {
	AuthAction
} from '@aws-amplify/core/internals/utils';


export async function handlePasswordlessSignIn(
	input: SignInWithOTPInput,
	authConfig: AuthConfig['Cognito']
) {
	const { userPoolId, userPoolClientId } = authConfig;
	const { username, options, destination } = input;
	const { clientMetadata } = options ?? {};
	const authParameters: Record<string, string> = {
		USERNAME: username,
	};

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: authParameters,
		ClientId: userPoolClientId,
	};

	console.log('jsonReqInitiateAuth: ', jsonReqInitiateAuth);
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
			'Amplify.Passwordless.signInMethod': 'OTP',
			'Amplify.Passwordless.action': 'REQUEST',
			'Amplify.Passwordless.deliveryMedium': getDeliveryMedium(destination),
		},
		ClientId: userPoolClientId,
	};
	console.log('jsonReqRespondToAuthChallenge: ', jsonReqRespondToAuthChallenge);

	return await respondToAuthChallenge(
		{
			region: getRegion(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		jsonReqRespondToAuthChallenge
	);
}

