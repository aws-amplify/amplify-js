// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	SignUpCommandInput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type SignUpClientInput = Pick<
	SignUpCommandInput,
	| 'Username'
	| 'Password'
	| 'UserAttributes'
	| 'ClientMetadata'
	| 'ValidationData'
>;

export async function signUpClient(
	params: SignUpClientInput
): Promise<SignUpCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: SignUpCommandOutput = await client.send<SignUpCommandOutput>(
		'SignUp',
		{
			...params,
			ClientId: authConfig?.userPoolWebClientId,
		}
	);
	return result;
}
