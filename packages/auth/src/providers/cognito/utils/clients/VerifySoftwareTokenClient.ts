// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	VerifySoftwareTokenCommandInput,
	VerifySoftwareTokenCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export async function verifySoftwareTokenClient(
	params: VerifySoftwareTokenCommandInput
): Promise<VerifySoftwareTokenCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result = await client.send<VerifySoftwareTokenCommandOutput>(
		'VerifySoftwareToken',
		{ ...params, ClientId: authConfig?.userPoolWebClientId }
	);
	return result;
}
