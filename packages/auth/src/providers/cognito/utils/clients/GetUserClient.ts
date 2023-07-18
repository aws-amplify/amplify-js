// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	GetUserCommandInput,
	GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export async function getUserClient(
	params: GetUserCommandInput
): Promise<GetUserCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);

	return client.send<GetUserCommandOutput>('GetUser', params);
}
