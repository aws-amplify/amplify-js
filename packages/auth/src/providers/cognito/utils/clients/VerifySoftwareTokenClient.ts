// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	VerifySoftwareTokenCommandInput,
	VerifySoftwareTokenCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export async function verifySoftwareTokenClient(
	params: VerifySoftwareTokenCommandInput
): Promise<VerifySoftwareTokenCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result = await client.send<VerifySoftwareTokenCommandOutput>(
		'VerifySoftwareToken',
		{ ...params, ClientId: UserPoolClient.clientId }
	);
	return result;
}
