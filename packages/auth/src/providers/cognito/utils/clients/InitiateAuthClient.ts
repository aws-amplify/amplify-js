// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
import { InitiateAuthClientInput } from './types/inputs';

export async function initiateAuthClient(
	params: InitiateAuthClientInput
): Promise<InitiateAuthCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: InitiateAuthCommandOutput =
		await client.send<InitiateAuthCommandOutput>({
			operation: 'InitiateAuth',
			input: {
				...params,
				ClientId: UserPoolClient.clientId,
			},
		});
	return result;
}
