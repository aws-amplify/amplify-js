// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SignUpCommandInput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Amplify } from '@aws-amplify/core';
import { UserPoolHttpClient } from './HttpClients';

export type SignUpClientInput = Partial<SignUpCommandInput> &
	Pick<SignUpCommandInput, 'Username'> &
	Pick<SignUpCommandInput, 'Password'> &
	Pick<SignUpCommandInput, 'UserAttributes'> &
	Pick<SignUpCommandInput, 'ClientMetadata'> &
	Pick<SignUpCommandInput, 'ValidationData'>;

export class UserpoolClient {
	public static async signUp(
		params: SignUpClientInput
	): Promise<SignUpCommandOutput> {
		const config = Amplify.config;
		// TODO: update when config is typed properly
		const region = config['aws_cognito_region'];
		const clientId = config['aws_user_pools_web_client_id'];
		const client = new UserPoolHttpClient(region);
		const result: SignUpCommandOutput = await client.send<SignUpCommandOutput>(
			'SignUp',
			{
				...params,
				ClientId: clientId,
			}
		);
		return result;
	}
}
