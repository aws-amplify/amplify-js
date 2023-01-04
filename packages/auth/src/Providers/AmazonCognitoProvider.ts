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
	AuthResetPasswordStep, 
	AuthSignUpStep, 
	DeliveryMedium, 
	CognitoSignUpOptions, 
	SignUpRequest, 
	AuthSignUpResult, 
	CognitoUserAttributeKey, 
	ValidationData, 
	AuthPluginProvider,
	AuthUserAttribute,
	CognitoConfirmResetPasswordOptions,
	ConfirmResetPasswordRequest,
	CognitoResetPasswordOptions,
	ResetPasswordRequest,
	ResetPasswordResult
} from '../types';
import { 
	AttributeType, 
	CodeDeliveryDetailsType, 
	CognitoIdentityProviderClient, 
	ConfirmForgotPasswordCommandOutput, 
	ForgotPasswordCommand, 
	ForgotPasswordCommandOutput, 
	SignUpCommand, 
	SignUpCommandOutput 
} from '@aws-sdk/client-cognito-identity-provider';
import { 
	createCognitoIdentityProviderClient, 
	createConfirmForgotPasswordCommand, 
	createForgotPasswordCommand, 
	createSignUpCommand, 
	getUserPoolId, 
	sendCommand 
} from '../utils/CognitoIdentityProviderClientUtils';
import { AuthError } from '../Errors';
import { AuthErrorTypes } from '../constants/AuthErrorTypes';

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const logger = new Logger('AmazonCognitoProvider');

export class AmazonCognitoProvider implements AuthPluginProvider {
	static category = 'Auth';
	static providerName = 'AmazonCognito';

	private _config;
	private _client: CognitoIdentityProviderClient;

	constructor(config?) {
		this._config = config ? config : {};
		this._client = createCognitoIdentityProviderClient(config);
	}

	/**
	 * Sign up using Amazon Cognito Provider with username, password, and other
	 * Amazon Cognito User Attributes
	 * @param {SignUpRequest} req Cognito user attributes, plugin, and auto sign in options
	 * @returns { AuthSignUpResult } if success, resolves Promise with next steps data
	 */
	async signUp<PluginOptions extends AuthPluginOptions = CognitoSignUpOptions>(
		req: SignUpRequest<CognitoUserAttributeKey, PluginOptions>
	): Promise<AuthSignUpResult<CognitoUserAttributeKey>> {
		const clientId: string = getUserPoolId(this._config);

		const username: string = req.username;
		if (!username) {
			throw new AuthError(AuthErrorTypes.EmptyUsername); // TODO: change when errors are defined
		}

		const password: string = req.password;
		if (!password) {
			throw new AuthError(AuthErrorTypes.EmptyPassword); // TODO: change when errors are defined
		}

		const userAttr: AttributeType[] | undefined = this.mapAttributes(req.options?.userAttributes);

		let validationData: AttributeType[] | undefined;
		let clientMetadata: Record<string, string> | undefined = this._config.clientMetadata;
		const pluginOptions = req.options?.pluginOptions;
		if (pluginOptions) {
			// TODO: change to pluginOptions.ValidationData if type of PluginOptions is mapped
			validationData = this.convertValidationDataObjectToArray(pluginOptions['validationData']);
			// TODO: change to pluginOptions.ClientMetadata if type of PluginOptions is mapped 
			clientMetadata = pluginOptions['clientMetadata']; 
		}

		const signUpCommand: SignUpCommand = createSignUpCommand(
			clientId, username, password, userAttr, validationData, clientMetadata);

		const signUpCommandOutput = await sendCommand<SignUpCommandOutput>(this._client, signUpCommand);
		
		return this.createSignUpResultObject(signUpCommandOutput);
	}

	private mapAttributes(
		attrs?: AuthUserAttribute<CognitoUserAttributeKey>[]
	):AttributeType[] | undefined {
		if (attrs) {
			return attrs.map(obj => ({
				Name: obj.userAttributeKey as string,
				Value: obj.value
			}));
		}	
	}

	private convertValidationDataObjectToArray(
		validationDataObject?: ValidationData
	): AttributeType[] | undefined  {
		if (validationDataObject) {
			return Object.entries(validationDataObject).map(([key, value]) => ({
				Name: key,
				Value: value
			}));
		}	
	}

	private createSignUpResultObject(
		signUpCommandOutput: SignUpCommandOutput
	):AuthSignUpResult<CognitoUserAttributeKey> {
		let result;
		if (signUpCommandOutput.UserConfirmed) {
			result = {
				isSignUpComplete: true,
				nextStep: {
					signUpStep: AuthSignUpStep.DONE
				}
			};
		} else {
			const codeDeliveryDetails: CodeDeliveryDetailsType | undefined = signUpCommandOutput.CodeDeliveryDetails;
			result = {
				isSignUpComplete: false,
				nextStep: {
					signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
					codeDeliveryDetails: {
						deliveryMedium: codeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
						destination: codeDeliveryDetails?.Destination as string,
						attributeName: codeDeliveryDetails?.AttributeName as CognitoUserAttributeKey
					}
				}
			};
		}
		// TODO: dispatch successful sign up hub event once it is defined
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

	/**
	 * Initiate a reset password request
	 * @param {ResetPasswordRequest} req: username and plugin options
	 * @returns {ResetPasswordResult} if success, returns promise with nextSteps data
	 */
	async resetPassword<PluginOptions extends AuthPluginOptions = CognitoResetPasswordOptions>(
		req: ResetPasswordRequest<PluginOptions>
	): Promise<ResetPasswordResult<CognitoUserAttributeKey>> {
		const clientId: string = getUserPoolId(this._config);
		const username: string = req.username;
		if (!username) {
			throw new AuthError(AuthErrorTypes.EmptyUsername); // TODO: change when errors are defined
		}
		let clientMetadata: Record<string, string> | undefined;
		const pluginOptions = req.options?.pluginOptions;
		if (pluginOptions) {
			clientMetadata = pluginOptions['clientMetadata'];
		} else if (this._config.clientMetadata) {
			clientMetadata = this._config.clientMetadata;
		}
		const forgotPasswordCommand: ForgotPasswordCommand = createForgotPasswordCommand(clientId, username, clientMetadata);
		const forgotPasswordCommandOutput = await sendCommand<ForgotPasswordCommandOutput>(
			this._client, forgotPasswordCommand
		);
		return this.createResetPasswordResultObject(forgotPasswordCommandOutput);
	}

	async confirmResetPassword<PluginOptions extends AuthPluginOptions = CognitoConfirmResetPasswordOptions>(
		req: ConfirmResetPasswordRequest<PluginOptions>
	): Promise<void> {
		const clientId: string = getUserPoolId(this._config);

		const username: string = req.username;
		if (!username) {
			throw new AuthError(AuthErrorTypes.EmptyUsername); // TODO: change when errors are defined
		}

		const code: string = req.code;
		if (!code) {
			throw new AuthError(AuthErrorTypes.EmptyCode); // TODO: change when errors are defined
		}

		const password: string = req.newPassword;
		if (!password) {
			throw new AuthError(AuthErrorTypes.EmptyPassword); // TODO: change when errors are defined
		}

		const pluginOptions = req.options?.pluginOptions;
		let clientMetadata: Record<string, string> | undefined = this._config.clientMetadata;
		if (pluginOptions) {
			clientMetadata = pluginOptions['clientMetadata'];
		}

		await sendCommand<ConfirmForgotPasswordCommandOutput>(
			this._client, 
			createConfirmForgotPasswordCommand(clientId, username, code, password, clientMetadata)
		);
	}

	private createResetPasswordResultObject(
		forgotPasswordCommandOutput: ForgotPasswordCommandOutput
	): ResetPasswordResult<CognitoUserAttributeKey> {
		const codeDeliveryDetails: CodeDeliveryDetailsType | undefined = forgotPasswordCommandOutput.CodeDeliveryDetails;
		return {
			isPasswordReset: false,
			nextStep: {
				resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
				codeDeliveryDetails: {
					deliveryMedium: codeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
					destination: codeDeliveryDetails?.Destination as string,
					attributeName: codeDeliveryDetails?.AttributeName as CognitoUserAttributeKey
				}
			}
		};
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
