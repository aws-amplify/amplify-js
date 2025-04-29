// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { AuthAction } from '@aws-amplify/core/internals/utils';

import { AuthTokenOrchestrator } from '../../../providers/cognito/tokenProvider/types';
import {
	ChallengeParameters,
	RespondToAuthChallengeCommandOutput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { ClientMetadata } from '../../../providers/cognito/types';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { getAuthenticationHelper } from '../../../providers/cognito/utils/srp';
import { getUserContextData } from '../../../providers/cognito/utils/userContextData';
import { setActiveSignInUsername } from '../../../providers/cognito/utils/setActiveSignInUsername';
import { retryOnResourceNotFoundException } from '../../../providers/cognito/utils/retryOnResourceNotFoundException';
import { handlePasswordVerifierChallenge } from '../../../providers/cognito/utils/handlePasswordVerifierChallenge';

/**
 * Handles the SELECT_CHALLENGE response specifically for Password SRP authentication.
 * This function combines the SELECT_CHALLENGE flow with Password SRP protocol.
 *
 * @param {string} username - The username for authentication
 * @param {string} password - The user's password
 * @param {ClientMetadata} [clientMetadata] - Optional metadata to be sent with auth requests
 * @param {CognitoUserPoolConfig} config - Cognito User Pool configuration
 * @param {string} session - The current authentication session token
 * @param {AuthTokenOrchestrator} tokenOrchestrator - Token orchestrator for managing auth tokens
 *
 * @returns {Promise<RespondToAuthChallengeCommandOutput>} The challenge response
 */
export async function handleSelectChallengeWithPasswordSRP(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined,
	config: CognitoUserPoolConfig,
	session: string,
	tokenOrchestrator: AuthTokenOrchestrator,
): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;
	const userPoolName = userPoolId.split('_')[1] || '';

	const authenticationHelper = await getAuthenticationHelper(userPoolName);

	const authParameters: Record<string, string> = {
		ANSWER: 'PASSWORD_SRP',
		USERNAME: username,
		SRP_A: authenticationHelper.A.toString(16),
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

	if (response.ChallengeName === 'PASSWORD_VERIFIER') {
		return retryOnResourceNotFoundException(
			handlePasswordVerifierChallenge,
			[
				password,
				response.ChallengeParameters as ChallengeParameters,
				clientMetadata,
				response.Session,
				authenticationHelper,
				config,
				tokenOrchestrator,
			],
			activeUsername,
			tokenOrchestrator,
		);
	}

	return response;
}
