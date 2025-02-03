// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';

import { ClientMetadata } from '../types';
import { AuthError } from '../../../errors/AuthError';
import { AuthTokenOrchestrator } from '../tokenProvider/types';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import {
	ChallengeParameters,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';

import { getNowString, getSignatureString } from './srp';
import { BigInteger } from './srp/BigInteger';
import { AuthenticationHelper } from './srp/AuthenticationHelper';
import { getUserContextData } from './userContextData';
import { handleDeviceSRPAuth } from './handleDeviceSRPAuth';

export async function handlePasswordVerifierChallenge(
	password: string,
	challengeParameters: ChallengeParameters,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	authenticationHelper: AuthenticationHelper,
	config: CognitoUserPoolConfig,
	tokenOrchestrator: AuthTokenOrchestrator,
): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolClientId, userPoolEndpoint } = config;
	const userPoolName = userPoolId?.split('_')[1] || '';
	const serverBValue = new (BigInteger as any)(challengeParameters?.SRP_B, 16);
	const salt = new (BigInteger as any)(challengeParameters?.SALT, 16);
	const username = challengeParameters?.USER_ID_FOR_SRP;
	if (!username)
		throw new AuthError({
			name: 'EmptyUserIdForSRPException',
			message: 'USER_ID_FOR_SRP was not found in challengeParameters',
		});
	const hkdf = await authenticationHelper.getPasswordAuthenticationKey({
		username,
		password,
		serverBValue,
		salt,
	});

	const dateNow = getNowString();

	const challengeResponses = {
		USERNAME: username,
		PASSWORD_CLAIM_SECRET_BLOCK: challengeParameters?.SECRET_BLOCK,
		TIMESTAMP: dateNow,
		PASSWORD_CLAIM_SIGNATURE: getSignatureString({
			username,
			userPoolName,
			challengeParameters,
			dateNow,
			hkdf,
		}),
	} as Record<string, string>;

	const deviceMetadata = await tokenOrchestrator.getDeviceMetadata(username);
	if (deviceMetadata && deviceMetadata.deviceKey) {
		challengeResponses.DEVICE_KEY = deviceMetadata.deviceKey;
	}

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const jsonReqResponseChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'PASSWORD_VERIFIER',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
		ClientId: userPoolClientId,
		UserContextData,
	};

	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const response = await respondToAuthChallenge(
		{ region: getRegionFromUserPoolId(userPoolId) },
		jsonReqResponseChallenge,
	);

	if (response.ChallengeName === 'DEVICE_SRP_AUTH')
		return handleDeviceSRPAuth({
			username,
			config,
			clientMetadata,
			session: response.Session,
			tokenOrchestrator,
		});

	return response;
}
