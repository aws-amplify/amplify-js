// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	getLargeAValue,
	getNowString,
	getPasswordAuthenticationKey,
	getSignatureString,
} from './AuthUtils';
import AuthenticationHelper from './AuthenticationHelper';
import BigInteger from './BigInteger';
import { initiateAuthClient } from './clients/InitiateAuthClient';
import { respondToAuthChallengeClient } from './clients/RespondToAuthChallengeClient';
import {
	InitiateAuthClientInput,
	RespondToAuthChallengeClientInput,
} from './clients/types/inputs';
import { ChallengeParameters } from './clients/types/models';
import { ClientMetadata } from '../types/models/ClientMetadata';

export async function handleUserSRPAuthFlow(
	username: string,
	password: string,
	clientMetadata: ClientMetadata | undefined
): Promise<RespondToAuthChallengeCommandOutput> {
	const config = Amplify.config;
	const userPoolId = config['aws_user_pools_id']
	const userPoolName = userPoolId.split('_')[1];
	const authenticationHelper = new AuthenticationHelper(userPoolName);

	const jsonReq: InitiateAuthClientInput = {
		AuthFlow: 'USER_SRP_AUTH',
		AuthParameters: {
			USERNAME: username,
			SRP_A: ((await getLargeAValue(authenticationHelper)) as any).toString(16),
		},
		ClientMetadata: clientMetadata,
	};

	const resp = await initiateAuthClient(jsonReq);
	const { ChallengeParameters: challengeParameters, Session: session } = resp;

	return handlePasswordVerifierChallenge(
		password,
		challengeParameters as ChallengeParameters,
		clientMetadata,
		session,
		authenticationHelper,
		userPoolName
	);
}

export async function handlePasswordVerifierChallenge(
	password: string,
	challengeParameters: ChallengeParameters,
	clientMetadata: ClientMetadata | undefined,
	session: string | undefined,
	authenticationHelper: AuthenticationHelper,
	userPoolName: string
): Promise<RespondToAuthChallengeCommandOutput> {
	const serverBValue = new BigInteger(challengeParameters?.SRP_B, 16);
	const salt = new BigInteger(challengeParameters?.SALT, 16);
	const username = challengeParameters?.USER_ID_FOR_SRP;
	const hkdf = await getPasswordAuthenticationKey({
		authenticationHelper,
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
			username: challengeParameters?.USER_ID_FOR_SRP,
			userPoolName,
			challengeParameters,
			dateNow,
			hkdf,
		}),
	} as { [key: string]: string };


	const jsonReqResponseChallenge: RespondToAuthChallengeClientInput = {
		ChallengeName: 'PASSWORD_VERIFIER',
		ChallengeResponses: challengeResponses,
		ClientMetadata: clientMetadata,
		Session: session,
	};

	return await respondToAuthChallengeClient(jsonReqResponseChallenge);
}
