// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	ConsoleLogger as Logger,
	Hub,
} from '@aws-amplify/core';
import { 
	AuthPluginOptions, 
	AuthPluginProvider, 
	AuthSignUpResult, 
	AuthUserAttributeKey, 
	CognitoUserAttributeKey, 
	SignUpRequest 
} from './types';
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
	private _pluggable: AuthPluginProvider | null;
	private _storage;

	/* BEGIN LEGACY CLASS MEMBERS TO ALLOW LIBRARY BUILD */

	/// TODO: These members are called from other libraries and can be uncommented temporarily to allow the library to build. Do not check-in uncommented member declarations to source.

	// public currentAuthenticatedUser;
	// public currentSession;
	// public currentCredentials;

	/* END LEGACY CLASS MEMBERS TO ALLOW LIBRARY BUILD */

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
	 * @param {AuthPluginProvider} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AuthPluginProvider) {
		// TODO: Align on whether we need to allow multiple plugins for Auth in single instance
		this._pluggable = pluggable;
	}

	/**
	 * Returns the plugin object
	 * @returns {AuthPluginProvider} The pluggable that has been added to the category
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

	/**
	 * Sign up with username, password, and other attributes (i.e. phone, email)
	 * @param {SignUpRequest} req Object contaning user attributes
	 * @returns {AuthSignUpResult} A promise resolves an object with next steps data if success
	 */
	signUp<PluginOptions extends AuthPluginOptions>(
		req: SignUpRequest<AuthUserAttributeKey, PluginOptions>
	): Promise<AuthSignUpResult<AuthUserAttributeKey>>;
	/**
	 * Sign up with username, password, and other attributes (i.e. phone, email) using Amazon
	 * Cognito Provider
	 * @param {SignUpRequest} req Object contaning Amazon Cognito user attributes, plugin, and auto sign in options
	 * @returns {AuthSignUpResult} A promise resolves an object with next steps data if success
	 */
	signUp<PluginOptions extends AuthPluginOptions>(
		req: SignUpRequest<CognitoUserAttributeKey, PluginOptions>
	): Promise<AuthSignUpResult<CognitoUserAttributeKey>> {
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
	confirmResetPassword<PluginOptions extends AuthPluginOptions = CognitoConfirmResetPasswordOptions>(
		req: ConfirmResetPasswordRequest<PluginOptions>
	): Promise<void> {
		assertPluginAvailable(this._pluggable);
		return this._pluggable.confirmResetPassword(req);
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
