// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { AuthAction } from '@aws-amplify/core/internals/utils';

import { ClientMetadata } from '../../../providers/cognito/types';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../../../providers/cognito/utils/userContextData';
import { RespondToAuthChallengeCommandOutput } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { setActiveSignInUsername } from '../../../providers/cognito/utils/signInHelpers';

/**
 * Handles the SELECT_CHALLENGE response specifically for Password authentication.
 * This function combines the SELECT_CHALLENGE flow with standard password authentication.
 *
 * @param {string} username - The username for authentication
 * @param {string} password - The user's password
 * @param {ClientMetadata} [clientMetadata] - Optional metadata to be sent with auth requests
 * @param {CognitoUserPoolConfig} config - Cognito User Pool configuration
 * @param {string} session - The current authentication session token
 *
 * @returns {Promise<RespondToAuthChallengeCommandOutput>} The challenge response
 */
export async function handleSelectChallengeWithPassword(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined,
	config: CognitoUserPoolConfig,
	session: string,
): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;

	const authParameters: Record<string, string> = {
		ANSWER: 'PASSWORD',
		USERNAME: username,
		PASSWORD: password,
	};

	const userContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const response = await respondToAuthChallenge(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		{
			ChallengeName: 'SELECT_CHALLENGE',
			ChallengeResponses: authParameters,
			ClientId: userPoolClientId,
			ClientMetadata: clientMetadata,
			Session: session,
			UserContextData: userContextData,
		},
	);

	const activeUsername = response.ChallengeParameters?.USERNAME ?? username;
	setActiveSignInUsername(activeUsername);

	return response;
}
