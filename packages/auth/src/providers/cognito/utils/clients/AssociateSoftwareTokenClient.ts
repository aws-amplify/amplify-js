// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	AssociateSoftwareTokenCommandInput,
	AssociateSoftwareTokenCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export async function associateSoftwareTokenClient(
	params: AssociateSoftwareTokenCommandInput
): Promise<AssociateSoftwareTokenCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result = await client.send<AssociateSoftwareTokenCommandOutput>(
		'AssociateSoftwareToken',
		{ ...params, ClientId: UserPoolClient.clientId }
	);
	return result;
}
