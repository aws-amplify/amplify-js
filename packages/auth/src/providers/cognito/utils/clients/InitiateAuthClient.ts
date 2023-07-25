// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type InitiateAuthClientInput = Pick<
	InitiateAuthCommandInput,
	'AuthFlow' | 'AuthParameters' | 'ClientMetadata'
>;

export async function initiateAuthClient(
	params: InitiateAuthClientInput
): Promise<InitiateAuthCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: InitiateAuthCommandOutput =
		await client.send<InitiateAuthCommandOutput>('InitiateAuth', {
			...params,
			ClientId: authConfig?.userPoolWebClientId,
		});
	return result;
}
