// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { AuthAction } from '@aws-amplify/core/internals/utils';

import { getUserContextData } from '../../../providers/cognito/utils/userContextData';
import { AuthTokenOrchestrator } from '../../../providers/cognito/tokenProvider/types';
import { AuthFlowType, ClientMetadata } from '../../../providers/cognito/types';
import {
	ChallengeParameters,
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandOutput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getAuthenticationHelper } from '../../../providers/cognito/utils/srp';
import {
	handlePasswordVerifierChallenge,
	retryOnResourceNotFoundException,
	setActiveSignInUsername,
} from '../../../providers/cognito/utils/signInHelpers';
import { createInitiateAuthClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { AuthFactorType } from '../../../providers/cognito/types/models';

interface HandlePasswordSRPInput {
	username: string;
	password: string;
	clientMetadata: ClientMetadata | undefined;
	config: CognitoUserPoolConfig;
	tokenOrchestrator: AuthTokenOrchestrator;
	authFlow: AuthFlowType;
	preferredChallenge?: AuthFactorType;
}

/**
 * Handles the Password SRP (Secure Remote Password) authentication flow.
 * This function can be used with both USER_SRP_AUTH and USER_AUTH flows.
 *
 * @param {Object} params - The parameters for the Password SRP authentication
 * @param {string} params.username - The username for authentication
 * @param {string} params.password - The user's password
 * @param {ClientMetadata} [params.clientMetadata] - Optional metadata to be sent with auth requests
 * @param {CognitoUserPoolConfig} params.config - Cognito User Pool configuration
 * @param {AuthTokenOrchestrator} params.tokenOrchestrator - Token orchestrator for managing auth tokens
 * @param {AuthFlowType} params.authFlow - The type of authentication flow ('USER_SRP_AUTH' or 'USER_AUTH')
 * @param {AuthFactorType} [params.preferredChallenge] - Optional preferred challenge type when using USER_AUTH flow
 *
 * @returns {Promise<RespondToAuthChallengeCommandOutput>} The authentication response
 */
export async function handlePasswordSRP({
	username,
	password,
	clientMetadata,
	config,
	tokenOrchestrator,
	authFlow,
	preferredChallenge,
}: HandlePasswordSRPInput): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;
	const userPoolName = userPoolId?.split('_')[1] || '';
	const authenticationHelper = await getAuthenticationHelper(userPoolName);

	const authParameters: Record<string, string> = {
		USERNAME: username,
		SRP_A: authenticationHelper.A.toString(16),
	};

	if (authFlow === 'USER_AUTH' && preferredChallenge) {
		authParameters.PREFERRED_CHALLENGE = preferredChallenge;
	}

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: authFlow,
		AuthParameters: authParameters,
		ClientMetadata: clientMetadata,
		ClientId: userPoolClientId,
		UserContextData,
	};

	const initiateAuth = createInitiateAuthClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const resp = await initiateAuth(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReq,
	);

	const { ChallengeParameters: challengeParameters, Session: session } = resp;
	const activeUsername = challengeParameters?.USERNAME ?? username;
	setActiveSignInUsername(activeUsername);
	if (resp.ChallengeName === 'PASSWORD_VERIFIER') {
		return retryOnResourceNotFoundException(
			handlePasswordVerifierChallenge,
			[
				password,
				challengeParameters as ChallengeParameters,
				clientMetadata,
				session,
				authenticationHelper,
				config,
				tokenOrchestrator,
			],
			activeUsername,
			tokenOrchestrator,
		);
	}

	return resp;
}
