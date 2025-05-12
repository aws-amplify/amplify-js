// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';

import { ClientMetadata } from '../types';
import { AuthTokenOrchestrator } from '../tokenProvider/types';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import {
	ChallengeParameters,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';

import { assertDeviceMetadata } from './types';
import {
	getAuthenticationHelper,
	getNowString,
	getSignatureString,
} from './srp';
import { BigInteger } from './srp/BigInteger';
import { AuthenticationHelper } from './srp/AuthenticationHelper';
import { getUserContextData } from './userContextData';

interface HandleDeviceSRPInput {
	username: string;
	config: CognitoUserPoolConfig;
	clientMetadata: ClientMetadata | undefined;
	session: string | undefined;
	tokenOrchestrator?: AuthTokenOrchestrator;
}

export async function handleDeviceSRPAuth({
	username,
	config,
	clientMetadata,
	session,
	tokenOrchestrator,
}: HandleDeviceSRPInput): Promise<RespondToAuthChallengeCommandOutput> {
	const { userPoolId, userPoolEndpoint } = config;
	const clientId = config.userPoolClientId;
	const deviceMetadata = await tokenOrchestrator?.getDeviceMetadata(username);
	assertDeviceMetadata(deviceMetadata);
	const authenticationHelper = await getAuthenticationHelper(
		deviceMetadata.deviceGroupKey,
	);
	const challengeResponses: Record<string, string> = {
		USERNAME: username,
		SRP_A: authenticationHelper.A.toString(16),
		DEVICE_KEY: deviceMetadata.deviceKey,
	};

	const jsonReqResponseChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'DEVICE_SRP_AUTH',
		ClientId: clientId,
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
	};
	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	const { ChallengeParameters: respondedChallengeParameters, Session } =
		await respondToAuthChallenge(
			{ region: getRegionFromUserPoolId(userPoolId) },
			jsonReqResponseChallenge,
		);

	return handleDevicePasswordVerifier(
		username,
		respondedChallengeParameters as ChallengeParameters,
		clientMetadata,
		Session,
		authenticationHelper,
		config,
		tokenOrchestrator,
	);
}

async function handleDevicePasswordVerifier(
	username: string,
	challengeParameters: ChallengeParameters,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	authenticationHelper: AuthenticationHelper,
	{ userPoolId, userPoolClientId, userPoolEndpoint }: CognitoUserPoolConfig,
	tokenOrchestrator?: AuthTokenOrchestrator,
): Promise<RespondToAuthChallengeCommandOutput> {
	const deviceMetadata = await tokenOrchestrator?.getDeviceMetadata(username);
	assertDeviceMetadata(deviceMetadata);

	const serverBValue = new BigInteger(challengeParameters?.SRP_B, 16);
	const salt = new BigInteger(challengeParameters?.SALT, 16);
	const { deviceKey } = deviceMetadata;
	const { deviceGroupKey } = deviceMetadata;
	const hkdf = await authenticationHelper.getPasswordAuthenticationKey({
		username: deviceMetadata.deviceKey,
		password: deviceMetadata.randomPassword,
		serverBValue,
		salt,
	});

	const dateNow = getNowString();
	const challengeResponses = {
		USERNAME: (challengeParameters?.USERNAME as string) ?? username,
		PASSWORD_CLAIM_SECRET_BLOCK: challengeParameters?.SECRET_BLOCK,
		TIMESTAMP: dateNow,
		PASSWORD_CLAIM_SIGNATURE: getSignatureString({
			username: deviceKey,
			userPoolName: deviceGroupKey,
			challengeParameters,
			dateNow,
			hkdf,
		}),
		DEVICE_KEY: deviceKey,
	} as Record<string, string>;

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const jsonReqResponseChallenge: RespondToAuthChallengeCommandInput = {
		ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
		ClientId: userPoolClientId,
		ChallengeResponses: challengeResponses,
		Session: session,
		ClientMetadata: clientMetadata,
		UserContextData,
	};
	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	return respondToAuthChallenge(
		{ region: getRegionFromUserPoolId(userPoolId) },
		jsonReqResponseChallenge,
	);
}
