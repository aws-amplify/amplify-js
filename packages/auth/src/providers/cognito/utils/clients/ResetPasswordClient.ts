// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { 
	ForgotPasswordCommandInput, 
	ForgotPasswordCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type ResetPasswordClientInput = Pick<
	ForgotPasswordCommandInput,
	| 'Username'
	| 'ClientMetadata'
>;

export async function resetPasswordClient(
	params: ResetPasswordClientInput
): Promise<ForgotPasswordCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ForgotPasswordCommandOutput = await client.send<ForgotPasswordCommandOutput>(
		'ForgotPassword',
		{
			...params,
			ClientId: UserPoolClient.clientId,
		}
	);
	return result;
}
