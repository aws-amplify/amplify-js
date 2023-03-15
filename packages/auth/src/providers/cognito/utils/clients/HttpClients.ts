// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	SignUpCommandInput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

const USER_AGENT = 'amplify test';

export type ClientInputs = SignUpCommandInput;
export type ClientOutputs = SignUpCommandOutput;
export type ClientOperations = 'SignUp' | 'ConfirmSignUp';

export class UserPoolHttpClient {
	private _endpoint: string;
	private _headers = {
		'Content-Type': 'application/x-amz-json-1.1',
		'X-Amz-User-Agent': USER_AGENT,
		'Cache-Control': 'no-store',
	};

	constructor(region: string) {
		this._endpoint = `https://cognito-idp.${region}.amazonaws.com/`;
	}

	async send<T extends ClientOutputs>(
		operation: ClientOperations,
		input: ClientInputs
	): Promise<ClientOutputs> {
		let headers = {
			...this._headers,
			'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
		};
		const options: RequestInit = {
			headers,
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify(input),
		};
		return (await (await fetch(this._endpoint, options)).json()) as T;
	}
}
