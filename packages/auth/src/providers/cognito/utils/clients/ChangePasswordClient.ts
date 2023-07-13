// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ChangePasswordCommandInput,
	ChangePasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export async function changePasswordClient(
	params: ChangePasswordCommandInput
): Promise<ChangePasswordCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ChangePasswordCommandOutput =
		await client.send<ChangePasswordCommandOutput>('ChangePassword', {
			...params,
		});
	return result;
}
