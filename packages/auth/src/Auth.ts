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
	Hub,
	Parser,
} from '@aws-amplify/core';
import { AuthStrings } from './constants/AuthStrings';
import { AmazonCognitoProvider } from './Providers/AmazonCognitoProvider';
import { AuthProvider } from './Providers/AuthProvider';

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
	 * Initialize Auth
	 * @param config - Configuration of Auth category
	 */
	constructor() {
		this._config = {};
		this._pluggable;
	}

	public getModuleName() {
		return 'Auth';
	}
	/**
	 * configure Auth
	 * @param {Object} config - Configuration of Auth
	 */
	public configure(config?) {
		return this._config;
	}

	/**
	 * add plugin into Auth category
	 * @param pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AuthProvider) {
		// TODO: Align on whether we need to allow multiple plugins for Auth in single instance
		this._pluggable = pluggable;
	}

	/**
	 * Get the plugin object
	 * @param providerName - the name of the provider to be removed
	 */
	public getPluggable() {
		return this._pluggable;
	}

	/**
	 * Remove the plugin object
	 * @param providerName - the name of the provider to be removed
	 */
	public removePluggable(): void {
		this._pluggable = null;
	}

	signUp(): Promise<any> {
		return this._pluggable
			? this._pluggable.signUp()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	confirmSignUp(): Promise<any> {
		return this._pluggable
			? this._pluggable.confirmSignUp()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	resendSignUpCode(): Promise<any> {
		return this._pluggable
			? this._pluggable.resendSignUpCode()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	signIn(): Promise<any> {
		return this._pluggable
			? this._pluggable.signIn()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	confirmSignIn(): Promise<any> {
		return this._pluggable
			? this._pluggable.confirmSignIn()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	signInWithWebUI(): Promise<any> {
		return this._pluggable
			? this._pluggable.signInWithWebUI()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	fetchSession(): Promise<any> {
		return this._pluggable
			? this._pluggable.fetchSession()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	signOut(): Promise<void> {
		return this._pluggable
			? this._pluggable.signOut()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	resetPassword(): Promise<void> {
		return this._pluggable
			? this._pluggable.resetPassword()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	confirmResetPassword(): Promise<void> {
		return this._pluggable
			? this._pluggable.confirmResetPassword()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	updatePassword(): Promise<void> {
		return this._pluggable
			? this._pluggable.updatePassword()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	fetchUserAttributes(): Promise<any> {
		return this._pluggable
			? this._pluggable.fetchUserAttributes()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	updateUserAttribute(): Promise<any> {
		return this._pluggable
			? this._pluggable.updateUserAttribute()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	updateUserAttributes(): Promise<any> {
		return this._pluggable
			? this._pluggable.updateUserAttributes()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	resendUserAttributeConfirmationCode(): Promise<any> {
		return this._pluggable
			? this._pluggable.resendUserAttributeConfirmationCode()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	rememberDevice(): Promise<any> {
		return this._pluggable
			? this._pluggable.rememberDevice()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	forgetDevice(): Promise<any> {
		return this._pluggable
			? this._pluggable.forgetDevice()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	fetchDevices(): Promise<any> {
		return this._pluggable
			? this._pluggable.fetchDevices()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
	deleteUser(): Promise<any> {
		return this._pluggable
			? this._pluggable.deleteUser()
			: Promise.reject(AuthStrings.NO_PLUGIN);
	}
}

export const Auth = new AuthClass();
Amplify.register(Auth);
