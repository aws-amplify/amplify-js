// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthAction } from '@aws-amplify/core/internals/utils';

import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	ChallengeName,
	RespondToAuthChallengeCommandInput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { createCognitoUserPoolEndpointResolver } from '../factories';

import { getUserContextData } from './userContextData';
import { HandleAuthChallengeRequest } from './types';

export async function handleMFAChallenge({
	challengeName,
	challengeResponse,
	clientMetadata,
	session,
	username,
	config,
}: HandleAuthChallengeRequest & {
	challengeName: Extract<
		ChallengeName,
		'EMAIL_OTP' | 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' | 'SMS_OTP'
	>;
}) {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;

	const challengeResponses: Record<string, string> = {
		USERNAME: username,
	};

	if (challengeName === 'EMAIL_OTP') {
		challengeResponses.EMAIL_OTP_CODE = challengeResponse;
	}

	if (challengeName === 'SMS_MFA') {
		challengeResponses.SMS_MFA_CODE = challengeResponse;
	}

	if (challengeName === 'SMS_OTP') {
		challengeResponses.SMS_OTP_CODE = challengeResponse;
	}

	if (challengeName === 'SOFTWARE_TOKEN_MFA') {
		challengeResponses.SOFTWARE_TOKEN_MFA_CODE = challengeResponse;
	}

	const userContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const jsonReq: RespondToAuthChallengeCommandInput = {
		ChallengeName: challengeName,
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		ClientId: userPoolClientId,
		UserContextData: userContextData,
	};

	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	return respondToAuthChallenge(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		jsonReq,
	);
}
