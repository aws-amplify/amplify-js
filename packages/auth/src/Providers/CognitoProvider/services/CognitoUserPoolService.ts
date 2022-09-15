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
	AuthFlowType,
	ChallengeNameType,
	CognitoIdentityProviderClient,
	CognitoIdentityProviderClientConfig,
	ConfirmSignUpCommand,
	ConfirmSignUpCommandInput,
	InitiateAuthCommand,
	InitiateAuthCommandInput,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommand,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
	SignUpCommand,
	SignUpCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	SignInParams,
	SignUpResult,
	SignUpParams,
	ConfirmSignUpParams,
	SignInWithPassword,
	ConfirmSignInParams,
	AmplifyUser,
} from '../../../types';
import {
	CognitoCompletePasswordOptions,
	CognitoConfirmSignInPluginOptions,
} from '../types/model';
import { StorageHelper } from '@aws-amplify/core';
import { CognitoSignUpPluginOptions } from '../types/model/signup/CognitoSignUpPluginOptions';
import { UserPoolConfig } from '../types/model/config';

interface CognitoUserPoolServiceConfig {
	region: string;
	userPoolId: string;
	clientId: string;
}

export class CognitoUserPoolService {
	private readonly config: UserPoolConfig;
	private readonly clientConfig: CognitoIdentityProviderClientConfig;
	private readonly cognitoCacheKey: String;

	client: CognitoIdentityProviderClient;

	constructor(config: CognitoUserPoolServiceConfig, cognitoCacheKey: String) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
		};
		this.client = new CognitoIdentityProviderClient(this.clientConfig);
		this.cognitoCacheKey = cognitoCacheKey;
	}

	async refreshUserPoolTokens(refreshToken: string) {
		const refreshTokenRes = await this.client.send(
			new InitiateAuthCommand({
				AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
				AuthParameters: {
					REFRESH_TOKEN: refreshToken,
				},
				ClientId: this.config.clientId,
			})
		);

		// refreshTokenRes.AuthenticationResult <- the JWT tokens
		return refreshTokenRes;
	}

	async confirmSignUp(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: ConfirmSignUpParams & { clientId: string }
	): Promise<SignUpResult> {
		const { clientId, username, confirmationCode } = params;
		const input: ConfirmSignUpCommandInput = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: confirmationCode,
		};
		const res = await this.client.send(new ConfirmSignUpCommand(input));
		return res;
	}

	async signIn(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignInParams & {
			password?: string;
			clientId: string;
			authFlow: AuthFlowType;
			storage?: Storage;
		}
	): Promise<InitiateAuthCommandOutput> {
		const { authFlow } = params;
		if (
			params.signInType === 'Link' ||
			params.signInType === 'Social' ||
			params.signInType === 'WebAuthn'
		) {
			throw new Error('Not implemented');
		}
		switch (authFlow) {
			case AuthFlowType.USER_PASSWORD_AUTH:
				return this.initiateAuthPlainUsernamePassword(clientConfig, params);
			default:
				throw new Error('Flow not yet implemented');
		}
	}

	async cognitoConfirmSignIn(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: ConfirmSignInParams<CognitoConfirmSignInPluginOptions>
	): Promise<RespondToAuthChallengeCommandOutput> {
		const { confirmationCode = '', username, pluginOptions } = params;
		let mfaType, challengeName, clientMetadata;
		if (pluginOptions != null) {
			const {
				mfaType = 'SMS_MFA',
				challengeName,
				clientMetadata,
			} = pluginOptions;
		}
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		challengeResponses.USERNAME = username;
		challengeResponses[
			mfaType === 'SMS_MFA' ? 'SMS_MFA_CODE' : 'SOFTWARE_TOKEN_MFA'
		] = confirmationCode;
		const res = await this.client.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: mfaType,
				ChallengeResponses: challengeResponses,
				ClientId: this.config.clientId,
				// Session: session,
			})
		);
		return res;
	}

	async cognitoSignUp(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignUpParams<CognitoSignUpPluginOptions> & { clientId: string }
	): Promise<SignUpResult> {
		const client = this.client;
		const { username, password, clientId, attributes } = params;
		const input: SignUpCommandInput = {
			Username: username,
			Password: password,
			ClientId: clientId,
			...(attributes && {
				UserAttributes: Object.entries(attributes).map(([k, v]) => ({
					Name: k,
					Value: v,
				})),
			}),
		};
		try {
			const res = await client.send(new SignUpCommand(input));
			return res;
		} catch (err) {
			throw err;
		}
	}

	async completeNewPassword({
		username,
		newPassword,
		session,
		requiredAttributes,
	}: CognitoCompletePasswordOptions) {
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		challengeResponses.NEW_PASSWORD = newPassword;
		challengeResponses.USERNAME = username;
		if (requiredAttributes) {
			for (const [k, v] of Object.entries(requiredAttributes)) {
				challengeResponses[`userAttributes.${k}`] = v;
			}
		}
		const res = await this.client.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
				ClientId: this.config.clientId,
				ChallengeResponses: challengeResponses,
				Session: session,
			})
		);
		return res;
	}

	async initiateAuthPlainUsernamePassword(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignInWithPassword & { authFlow: AuthFlowType; clientId: string }
	): Promise<InitiateAuthCommandOutput> {
		const { username, password, authFlow, clientId, clientMetadata } = params;
		if (!password) throw new Error('No password');
		const initiateAuthInput: InitiateAuthCommandInput = {
			AuthFlow: authFlow,
			ClientId: clientId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
			ClientMetadata: clientMetadata,
		};
		const res = await this.client.send(
			new InitiateAuthCommand(initiateAuthInput)
		);
		return res;
	}

	cacheInitiateAuthResult(
		output: InitiateAuthCommandOutput,
		userStorage = new StorageHelper().getStorage()
	) {
		const { AuthenticationResult, Session } = output;
		if (!AuthenticationResult) {
			throw new Error(
				'Cannot cache session data - Initiate Auth did not return tokens'
			);
		}
		const {
			AccessToken,
			IdToken,
			RefreshToken,
			ExpiresIn = 0,
		} = AuthenticationResult;
		userStorage.setItem(
			this.cognitoCacheKey,
			JSON.stringify({
				accessToken: AccessToken,
				idToken: IdToken,
				refreshToken: RefreshToken,
				// ExpiresIn is in seconds, but Date().getTime is in milliseconds
				expiration: new Date().getTime() + ExpiresIn * 1000,
				...(Session && { session: Session }),
			})
		);
	}
}
