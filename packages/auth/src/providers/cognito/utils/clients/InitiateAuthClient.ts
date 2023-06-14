// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type InitiateAuthClientInput = Pick<
	InitiateAuthCommandInput,
	'AuthFlow' | 'AuthParameters' | 'ClientMetadata'
>;

export async function initiateAuthClient(
	params: InitiateAuthClientInput
): Promise<InitiateAuthCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: InitiateAuthCommandOutput =
		await client.send<InitiateAuthCommandOutput>('InitiateAuth', {
			...params,
			ClientId: UserPoolClient.clientId,
		});
	return result;
}
