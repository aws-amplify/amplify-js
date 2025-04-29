// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { AuthAction } from '@aws-amplify/core/internals/utils';

import { getUserContextData } from '../../../providers/cognito/utils/userContextData';
import { AuthTokenOrchestrator } from '../../../providers/cognito/tokenProvider/types';
import { AuthFactorType } from '../../../providers/cognito/types/models';
import {
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { createInitiateAuthClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { getAuthUserAgentValue } from '../../../utils';
import { handlePasswordSRP } from '../shared/handlePasswordSRP';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { setActiveSignInUsername } from '../../../providers/cognito/utils/setActiveSignInUsername';

export interface HandleUserAuthFlowInput {
	username: string;
	config: CognitoUserPoolConfig;
	tokenOrchestrator: AuthTokenOrchestrator;
	clientMetadata?: Record<string, string>;
	preferredChallenge?: AuthFactorType;
	password?: string;
	session?: string;
}

/**
 * Handles user authentication flow with configurable challenge preferences.
 * Supports AuthFactorType challenges through the USER_AUTH flow.
 *
 * @param {HandleUserAuthFlowInput} params - Authentication flow parameters
 * @param {string} params.username - The username for authentication
 * @param {Record<string, string>} [params.clientMetadata] - Optional metadata to pass to authentication service
 * @param {CognitoUserPoolConfig} params.config - Cognito User Pool configuration
 * @param {AuthTokenOrchestrator} params.tokenOrchestrator - Manages authentication tokens and device tracking
 * @param {AuthFactorType} [params.preferredChallenge] - Optional preferred authentication method
 * @param {string} [params.password] - Required when preferredChallenge is 'PASSWORD' or 'PASSWORD_SRP'
 *
 * @returns {Promise<InitiateAuthCommandOutput>} The authentication response from Cognito
 */
export async function handleUserAuthFlow({
	username,
	clientMetadata,
	config,
	tokenOrchestrator,
	preferredChallenge,
	password,
	session,
}: HandleUserAuthFlowInput) {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;
	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});
	const authParameters: Record<string, string> = { USERNAME: username };

	if (preferredChallenge) {
		if (preferredChallenge === 'PASSWORD_SRP') {
			assertValidationError(
				!!password,
				AuthValidationErrorCode.EmptySignInPassword,
			);

			return handlePasswordSRP({
				username,
				password,
				clientMetadata,
				config,
				tokenOrchestrator,
				authFlow: 'USER_AUTH',
				preferredChallenge,
			});
		}

		if (preferredChallenge === 'PASSWORD') {
			assertValidationError(
				!!password,
				AuthValidationErrorCode.EmptySignInPassword,
			);
			authParameters.PASSWORD = password;
		}

		authParameters.PREFERRED_CHALLENGE = preferredChallenge;
	}

	const jsonReq: InitiateAuthCommandInput = {
		AuthFlow: 'USER_AUTH',
		AuthParameters: authParameters,
		ClientMetadata: clientMetadata,
		ClientId: userPoolClientId,
		UserContextData,
	};

	if (session) {
		jsonReq.Session = session;
	}

	const initiateAuth = createInitiateAuthClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const response = await initiateAuth(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.SignIn),
		},
		jsonReq,
	);

	// Set the active username immediately after successful authentication attempt
	// If a user starts a new sign-in while another sign-in is incomplete,
	// this ensures we're tracking the correct user for subsequent auth challenges.
	setActiveSignInUsername(username);

	return response;
}
