/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {
	ConsoleLogger as Logger,
	Hub,
	getAmplifyUserAgent,
} from '@aws-amplify/core';
import { 
	AuthPluginOptions, 
	AuthSignUpStep, 
	DeliveryMedium, 
	CognitoSignUpOptions, 
	SignUpRequest, 
	AuthSignUpResult, 
	CognitoUserAttributeKey, 
	ValidationData, 
	AuthProvider
} from '../types';
import { AttributeType, CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { createCognitoIdentityProviderClient, createSignUpCommand, getUserPoolId, sendCommand } from '../utils/CognitoIdentityProviderClientUtils';
import { AuthError } from '../Errors';
import { AuthErrorTypes } from '../constants/AuthErrorTypes';

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const logger = new Logger('AmazonCognitoProvider');

export class AmazonCognitoProvider implements AuthProvider {
	static category = 'Auth';
	static providerName = 'AmazonCognito';

	private _config;
	private _client: CognitoIdentityProviderClient;

	constructor(config?) {
		this._config = config ? config : {};
		this._client = createCognitoIdentityProviderClient(config);
	}
	async signUp<PluginOptions extends AuthPluginOptions = CognitoSignUpOptions>(
		req: SignUpRequest<CognitoUserAttributeKey, PluginOptions>
	): Promise<AuthSignUpResult<CognitoUserAttributeKey>> {
		const clientId: string = getUserPoolId(this._config);

		const username: string = req.username;
		if (!username) {
			throw new AuthError(AuthErrorTypes.EmptyUsername); // TODO change when errors are defined
		}

		const password: string = req.password;
		if (!password) {
			throw new AuthError(AuthErrorTypes.EmptyPassword); // TODO change when errors are defined
		}

		let userAttr: AttributeType[] | undefined;
		const attrs = req.options?.userAttributes;
		if (attrs) {
			userAttr = attrs.map(obj => ({
				Name: obj.userAttributeKey as string,
				Value: obj.value
			}));
		}

		let validationData: AttributeType[] | undefined;
		let clientMetadata: Record<string, string> | undefined;
		const pluginOptions = req.options?.pluginOptions;
		if (pluginOptions) {
			const validationDataObject: ValidationData = pluginOptions['ValidationData'];
			if (validationDataObject) {
				validationData = Object.entries(validationDataObject).map(([key, value]) => ({
					Name: key,
					Value: value
				}));
			}
			clientMetadata = pluginOptions['ClientMetadata'];
		}

		const signUpCommand: SignUpCommand = createSignUpCommand(clientId, username, password, userAttr, validationData, clientMetadata);

		const signUpCommandOutput: any = await sendCommand(this._client, signUpCommand);
		let result: AuthSignUpResult<CognitoUserAttributeKey>;
		if (signUpCommandOutput.UserConfirmed) {
			result = {
				isSignUpComplete: true,
				nextStep: {
					signUpStep: AuthSignUpStep.DONE
				}
			};
		} else {
			const codeDeliveryDetails = signUpCommandOutput.CodeDeliveryDetails;
			result = {
				isSignUpComplete: false,
				nextStep: {
					signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
					codeDeliveryDetails: {
						deliveryMedium: codeDeliveryDetails.DeliveryMedium as DeliveryMedium,
						destination: codeDeliveryDetails.Destination as string,
						attributeName: codeDeliveryDetails.AttributeName as CognitoUserAttributeKey
					}
				}
			}
		}
		// TODO dispatch successful sign up hub event once it is defined
		return result;
	}
	confirmSignUp(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	resendSignUpCode(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	signIn(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	confirmSignIn(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	signInWithWebUI(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	fetchSession(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	signOut(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	resetPassword(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	confirmResetPassword(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	updatePassword(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	fetchUserAttributes(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	updateUserAttribute(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	updateUserAttributes(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	resendUserAttributeConfirmationCode(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	rememberDevice(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	forgetDevice(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	fetchDevices(): Promise<any> {
		throw new Error('Method not implemented.');
	}
	deleteUser(): Promise<any> {
		throw new Error('Method not implemented.');
	}

	/**
	 * get the category of the plugin
	 */
	getCategory(): string {
		return AmazonCognitoProvider.category;
	}

	/**
	 * get provider name of the plugin
	 */
	getProviderName(): string {
		return AmazonCognitoProvider.providerName;
	}

	/**
	 * configure the plugin
	 * @param {Object} config - configuration
	 */
	public configure() {
		logger.debug(
			`configure ${this.getCategory()} category with ${this.getProviderName()}}`
		);
	}
}

/**
 * @deprecated use named import
 */
export default AmazonCognitoProvider;
