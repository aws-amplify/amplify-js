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
import { IdentityPoolConfig } from '../types/model/amplifyConfig';

export class CognitoIdentityPoolService {
	private readonly config: IdentityPoolConfig;
	private readonly clientConfig: CognitoIdentityProviderClientConfig;
	private cognitoIDPLoginKey?: string;
	client: CognitoIdentityClient;

	constructor(config: IdentityPoolConfig, userpoolId?: string) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
		};
		if (userpoolId) {
			this.cognitoIDPLoginKey = `cognito-idp.${this.config.region}.amazonaws.com/${userpoolId}`;
		}

		this.client = new CognitoIdentityClient(this.clientConfig);
	}

	async fetchIdentityId(idToken: string) {
		var getIdCommandParams = { IdentityPoolId: this.config.identityPoolId };
		var logins = {
			Logins: {
				[this.cognitoIDPLoginKey!]: idToken,
			},
		};
		if (this.cognitoIDPLoginKey) {
			getIdCommandParams = {
				...getIdCommandParams,
				...logins,
			};
		}
		const getIdRes = await this.client.send(
			new GetIdCommand(getIdCommandParams)
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
		var getCredentialsForIdentityCommandParams = {
			IdentityId: identityID,
		};
		var logins = {
			Logins: {
				[this.cognitoIDPLoginKey!]: idToken,
			},
		};
		if (this.cognitoIDPLoginKey) {
			getCredentialsForIdentityCommandParams = {
				...getCredentialsForIdentityCommandParams,
				...logins,
			};
		}
		const getCredentialsRes = await this.client.send(
			new GetCredentialsForIdentityCommand(
				getCredentialsForIdentityCommandParams
			)
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
