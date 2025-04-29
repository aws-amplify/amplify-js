// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { AuthAction } from '@aws-amplify/core/internals/utils';

import { ClientMetadata } from '../../../providers/cognito/types';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { RespondToAuthChallengeCommandOutput } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';

/**
 * Handles the SELECT_CHALLENGE response for authentication.
 * Initiates the selected authentication challenge based on user choice.
 *
 * @param {Object} params - The parameters for handling the selected challenge
 * @param {string} params.username - The username for authentication
 * @param {string} params.session - The current authentication session token
 * @param {string} params.selectedChallenge - The challenge type selected by the user
 * @param {CognitoUserPoolConfig} params.config - Cognito User Pool configuration
 * @param {ClientMetadata} [params.clientMetadata] - Optional metadata to be sent with auth requests
 *
 * @returns {Promise<RespondToAuthChallengeCommandOutput>} The challenge response
 */
export async function initiateSelectedChallenge({
	username,
	session,
	selectedChallenge,
	config,
	clientMetadata,
}: {
	username: string;
	session: string;
	selectedChallenge: string;
	config: CognitoUserPoolConfig;
	clientMetadata?: ClientMetadata;
}): Promise<RespondToAuthChallengeCommandOutput> {
	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: config.userPoolEndpoint,
		}),
	});

	return respondToAuthChallenge(
		{
			region: getRegionFromUserPoolId(config.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		{
			ChallengeName: 'SELECT_CHALLENGE',
			ChallengeResponses: {
				USERNAME: username,
				ANSWER: selectedChallenge,
			},
			ClientId: config.userPoolClientId,
			Session: session,
			ClientMetadata: clientMetadata,
		},
	);
}
