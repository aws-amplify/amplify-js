// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
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
	// TODO: update when config is typed properly
	config = Amplify.config;
	region = this.config['aws_cognito_region'];
	clientId = this.config['aws_user_pools_web_client_id'];

	public async signUp(params: SignUpClientInput): Promise<SignUpCommandOutput> {
		const client = new UserPoolHttpClient(this.region);
		const result: SignUpCommandOutput = await client.send<SignUpCommandOutput>(
			'SignUp',
			{
				...params,
				ClientId: this.clientId,
			}
		);
		return result;
	}
}
