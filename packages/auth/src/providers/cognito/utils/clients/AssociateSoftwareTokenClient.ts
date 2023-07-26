// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	AssociateSoftwareTokenCommandInput,
	AssociateSoftwareTokenCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export async function associateSoftwareTokenClient(
	params: AssociateSoftwareTokenCommandInput
): Promise<AssociateSoftwareTokenCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result = await client.send<AssociateSoftwareTokenCommandOutput>(
		'AssociateSoftwareToken',
		{ ...params, ClientId: authConfig?.userPoolWebClientId }
	);
	return result;
}
