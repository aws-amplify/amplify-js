// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { 
	ForgotPasswordCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
import { ResetPasswordClientInput } from './types/inputs';

export async function resetPasswordClient(
	params: ResetPasswordClientInput
): Promise<ForgotPasswordCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ForgotPasswordCommandOutput =
		await client.send<ForgotPasswordCommandOutput>({
			operation: 'ForgotPassword',
			input: {
				...params,
				ClientId: UserPoolClient.clientId,
			},
		});
	return result;
}
