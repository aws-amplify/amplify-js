/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
	Amplify,
	ConsoleLogger as Logger,
	Hub
} from '@aws-amplify/core';
import { AuthPluginOptions, AuthSignUpResult, CognitoSignUpOptions, CognitoUserAttributeKey, SignUpRequest } from './types/AmazonCognitoProvider';
import { AuthProvider } from './types/AuthProvider';
import { assertPluginAvailable } from './utils/assertPluginAvailable';

const logger = new Logger('AuthClass');

/* BEGIN LEGACY CONSTANTS */

/// TODO: Handle these constants appropriately
const USER_ADMIN_SCOPE = 'aws.cognito.signin.user.admin';
// 10 sec, following this guide https://www.nngroup.com/articles/response-times-3-important-limits/
const OAUTH_FLOW_MS_TIMEOUT = 10 * 1000;
// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;
const MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;

/* END LEGACY CONSTANTS */

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const dispatchAuthEvent = (event: string, data: any, message: string) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

/**
 * Provide Auth client functions
 */
export class AuthClass {
	private _config;
	private _pluggable: AuthProvider | null;
	private _storage;

	/**
	 * Instantiates the Auth category
	 */
	constructor() {
		this._config = {};
		this._pluggable;
	}

	/**
	 * Returns the category name
	 */
	public getModuleName() {
		return 'Auth';
	}
	/**
	 * Configures the Auth category
	 * @param {Object} config - The Auth configuration object
	 */
	public configure(config?) {
		return this._config;
	}

	/**
	 * Adds a plugin to the Auth category
	 * @param {AuthProvider} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AuthProvider) {
		// TODO: Align on whether we need to allow multiple plugins for Auth in single instance
		this._pluggable = pluggable;
	}

	/**
	 * Returns the plugin object
	 * @returns {AuthProvider} The pluggable that has been added to the category
	 */
	public getPluggable() {
		return this._pluggable;
	}

	/**
	 * Removes the plugin object
	 */
	public removePluggable(): void {
		this._pluggable = null;
	}

	public signUp<PluginOptions extends Record<string, any>>(req: SignUpRequest<string, PluginOptions>): Promise<any>;
	public signUp<PluginOptions extends AuthPluginOptions = 
	CognitoSignUpOptions>(req: SignUpRequest<CognitoUserAttributeKey,PluginOptions>):
	Promise<AuthSignUpResult<CognitoUserAttributeKey>> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.signUp(req);
	}
	confirmSignUp(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.confirmSignUp();
	}
	resendSignUpCode(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.resendSignUpCode();
	}
	signIn(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.signIn();
	}
	confirmSignIn(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.confirmSignIn();
	}
	signInWithWebUI(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.signInWithWebUI();
	}
	fetchSession(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.fetchSession();
	}
	signOut(): Promise<void> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.signOut();
	}
	resetPassword(): Promise<void> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.resetPassword();
	}
	confirmResetPassword(): Promise<void> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.confirmResetPassword();
	}
	updatePassword(): Promise<void> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.updatePassword();
	}
	fetchUserAttributes(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.fetchUserAttributes();
	}
	updateUserAttribute(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.updateUserAttribute();
	}
	updateUserAttributes(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.updateUserAttributes();
	}
	resendUserAttributeConfirmationCode(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.resendUserAttributeConfirmationCode();
	}
	rememberDevice(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.rememberDevice();
	}
	forgetDevice(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.forgetDevice();
	}
	fetchDevices(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.fetchDevices();
	}
	deleteUser(): Promise<any> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.deleteUser();
	}
}

export const Auth = new AuthClass();
Amplify.register(Auth);
