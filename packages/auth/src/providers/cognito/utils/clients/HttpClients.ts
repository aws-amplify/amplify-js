// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ConfirmForgotPasswordCommandInput,
	ConfirmForgotPasswordCommandOutput,
	ForgotPasswordCommandInput,
	ForgotPasswordCommandOutput,
	ResendConfirmationCodeCommandInput,
	ResendConfirmationCodeCommandOutput,
	SignUpCommandInput,
	SignUpCommandOutput,
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
	ConfirmSignUpCommandOutput,
	ConfirmSignUpCommandInput,
	VerifySoftwareTokenCommandInput,
	VerifySoftwareTokenCommandOutput,
	AssociateSoftwareTokenCommandInput,
	AssociateSoftwareTokenCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthError } from '../../../../errors/AuthError';
import { assertServiceError } from '../../../../errors/utils/assertServiceError';
import { AuthConfig } from '@aws-amplify/core';
import { isTypeUserPoolConfig } from '../types';

// TODO: Update the user-agent value
const USER_AGENT = 'amplify test';

export type ClientInputs =
	| SignUpCommandInput
	| ForgotPasswordCommandInput
	| ConfirmForgotPasswordCommandInput
	| InitiateAuthCommandInput
	| RespondToAuthChallengeCommandInput
	| ResendConfirmationCodeCommandInput
	| ConfirmSignUpCommandInput
	| VerifySoftwareTokenCommandInput
	| AssociateSoftwareTokenCommandInput;

export type ClientOutputs =
	| SignUpCommandOutput
	| ForgotPasswordCommandOutput
	| ConfirmForgotPasswordCommandOutput
	| InitiateAuthCommandOutput
	| RespondToAuthChallengeCommandOutput
	| ResendConfirmationCodeCommandOutput
	| ConfirmSignUpCommandOutput
	| VerifySoftwareTokenCommandOutput
	| AssociateSoftwareTokenCommandOutput;

export type ClientOperations =
	| 'SignUp'
	| 'ConfirmSignUp'
	| 'ForgotPassword'
	| 'ConfirmForgotPassword'
	| 'InitiateAuth'
	| 'RespondToAuthChallenge'
	| 'ResendConfirmationCode'
	| 'VerifySoftwareToken'
	| 'AssociateSoftwareToken';

export class UserPoolHttpClient {
	private _endpoint: string;
	private _headers = {
		'Content-Type': 'application/x-amz-json-1.1',
		'X-Amz-User-Agent': USER_AGENT,
		'Cache-Control': 'no-store',
	};

	constructor(authConfig?: AuthConfig) {
		if (authConfig && isTypeUserPoolConfig(authConfig)) {
			const region = authConfig.userPoolId.split('_')[0];
			this._endpoint = `https://cognito-idp.${region}.amazonaws.com/`;
		} else {
			throw new Error('error'); // TODO: update error
		}
	}

	async send<T extends ClientOutputs>(
		operation: ClientOperations,
		input: ClientInputs
	): Promise<T> {
		const headers = {
			...this._headers,
			'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
		};
		const options: RequestInit = {
			headers,
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify(input),
		};
		try {
			return (await (await fetch(this._endpoint, options)).json()) as T;
		} catch (error) {
			assertServiceError(error);
			throw new AuthError({ name: error.name, message: error.message });
		}
	}
}
