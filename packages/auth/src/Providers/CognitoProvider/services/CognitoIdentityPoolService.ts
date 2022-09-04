/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {
	CognitoIdentityClient,
	GetCredentialsForIdentityCommand,
	GetIdCommand,
} from '@aws-sdk/client-cognito-identity';
import { CognitoIdentityProviderClientConfig } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoServiceConfig } from '../types/model/config/CognitoServiceConfig';

export class CognitoIdentityPoolService {
	private readonly config: CognitoServiceConfig;
	private readonly clientConfig: CognitoIdentityProviderClientConfig;
	private cognitoIDPLoginKey: string;
	client: CognitoIdentityClient;

	constructor(
		config: CognitoServiceConfig,
		clientConfig: CognitoIdentityProviderClientConfig = {},
		cognitoIDPLoginKey: string
	) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
			...clientConfig,
		};
		this.cognitoIDPLoginKey = cognitoIDPLoginKey;
		this.client = new CognitoIdentityClient(this.clientConfig);
	}

	async fetchIdentityId(idToken: string) {
		const getIdRes = await this.client.send(
			new GetIdCommand({
				IdentityPoolId: this.config.identityPoolId,
				Logins: {
					[this.cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		return getIdRes.IdentityId;
	}

	async fetchUnAuthIdentityID() {
		const getIdRes = await this.client.send(
			new GetIdCommand({
				IdentityPoolId: this.config.identityPoolId,
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		return getIdRes.IdentityId;
	}

	async fetchAWSCredentials(identityID: string, idToken: string) {
		const getCredentialsRes = await this.client.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: identityID,
				Logins: {
					[this.cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getCredentialsRes.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		return getCredentialsRes.Credentials;
	}

	async fetchUnAuthAWSCredentials(identityID: string) {
		const getCredentialsRes = await this.client.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: identityID,
			})
		);
		if (!getCredentialsRes.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		return getCredentialsRes.Credentials;
	}
}
