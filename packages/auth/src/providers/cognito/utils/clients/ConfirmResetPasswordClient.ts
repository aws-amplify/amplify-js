// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	ConfirmForgotPasswordCommandInput, 
	ConfirmForgotPasswordCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type ConfirmResetPasswordClientInput = Pick<
	ConfirmForgotPasswordCommandInput,
	| 'Username'
	| 'ConfirmationCode'
	| 'Password'
	| 'ClientMetadata'
>;

export async function confirmResetPasswordClient(
	params: ConfirmResetPasswordClientInput
): Promise<ConfirmForgotPasswordCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ConfirmForgotPasswordCommandOutput = await client.send<ConfirmForgotPasswordCommandOutput>(
		'ConfirmForgotPassword',
		{
			...params,
			ClientId: UserPoolClient.clientId,
		}
	);
	return result;
}
