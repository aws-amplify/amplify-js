// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import type {
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type RespondToAuthChallengeClientInput = Pick<
	RespondToAuthChallengeCommandInput,
	'ChallengeName' | 'ChallengeResponses' | 'ClientMetadata' | 'Session'
>;

export async function respondToAuthChallengeClient(
	params: RespondToAuthChallengeClientInput
): Promise<RespondToAuthChallengeCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: RespondToAuthChallengeCommandOutput =
		await client.send<RespondToAuthChallengeCommandOutput>(
			'RespondToAuthChallenge',
			{
				...params,
				ClientId: authConfig?.userPoolWebClientId,
			}
		);
	return result;
}
