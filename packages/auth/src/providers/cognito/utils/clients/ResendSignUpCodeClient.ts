// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ResendConfirmationCodeCommandInput,
	ResendConfirmationCodeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { Amplify } from '@aws-amplify/core';

export type ResendConfirmationCodeClientInput = Pick<
	ResendConfirmationCodeCommandInput,
	'Username' | 'ClientMetadata'
>;

export async function resendSignUpConfirmationCodeClient(
	params: ResendConfirmationCodeClientInput
): Promise<ResendConfirmationCodeCommandOutput> {
	const UserPoolClient = {
		// TODO: update when config is typed properly
		region: Amplify.config['aws_cognito_region'],
		clientId: Amplify.config['aws_user_pools_web_client_id'],
	};
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ResendConfirmationCodeCommandOutput =
		await client.send<ResendConfirmationCodeCommandOutput>(
			'ResendConfirmationCode',
			{
				...params,
				ClientId: UserPoolClient.clientId,
			}
		);
	return result;
}
