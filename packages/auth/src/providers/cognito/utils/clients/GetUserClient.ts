// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	GetUserCommandInput,
	GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export async function getUserClient(
	params: GetUserCommandInput
): Promise<GetUserCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);

	return client.send<GetUserCommandOutput>('GetUser', {
		...params,
		ClientId: authConfig?.userPoolWebClientId,
	});
}
