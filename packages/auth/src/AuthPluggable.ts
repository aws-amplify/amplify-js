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

import { Amplify, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import {
	SignUpParams,
	SignInResult,
	SignInParams,
	ConfirmSignUpParams,
	SignUpResult,
	ConfirmSignInParams,
	AmplifyUser,
	PluginConfig,
	AddAuthenticatorResponse,
	RequestScopeResponse,
	AuthZOptions,
	AuthorizationResponse,
	ConfirmSignUpResult,
} from './types';
import { AuthProvider } from './types/Provider';

const logger = new Logger('AuthClass');

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

export const dispatchAuthEvent = (
	event: string,
	data: any,
	message: string
) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

export class AuthPlugClass {
	private _config;
	// not array only one plugin at a time
	private _pluggables: AuthProvider[];

	constructor() {
		this._config = {};
		this._pluggables = [];
	}

	public getModuleName() {
		return 'Auth';
	}

	/**
	 * Add plugin into Auth category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AuthProvider) {
		if (pluggable && pluggable.getCategory() === 'Auth') {
			// auth will work with only one plugin ATM
			this._pluggables.push(pluggable);
			let config = {};

			config = pluggable.configure(this._config[pluggable.getProviderName()]);

			return config;
		}
	}

	/**
	 * Get the plugin object
	 * @param providerName - the name of the plugin
	 */
	public getPluggable(providerName: string) {
		const pluggable = this._pluggables.find(
			pluggable => pluggable.getProviderName() === providerName
		);
		if (pluggable === undefined) {
			logger.debug('No plugin found with providerName', providerName);
			return null;
		} else return pluggable;
	}

	/**
	 * Remove the plugin object
	 * @param providerName - the name of the plugin
	 */
	public removePluggable(providerName: string) {
		this._pluggables = this._pluggables.filter(
			pluggable => pluggable.getProviderName() !== providerName
		);
		return;
	}

	/**
	 * Configure auth
	 * @param {Object} config - Configuration object for auth
	 * @return {Object} - Current configuration
	 */
	public configure(config?: PluginConfig) {
		if (!config) return;
		this._config = config.Auth || config;

		if (this._pluggables.length > 0) {
			this._pluggables[0].configure(
				this._config[this._pluggables[0].getProviderName()]
			);
		}
		dispatchAuthEvent(
			'configured',
			null,
			`The Auth category has been configured successfully`
		);
		logger.debug('current configuration', this._config);
		return this._config;
	}

	public signIn(signInParams: SignInParams): Promise<SignInResult> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].signIn(signInParams);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public signUp(signUpParams: SignUpParams): Promise<SignUpResult> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].signUp(signUpParams);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public confirmSignUp(
		confirmSignUpParams: ConfirmSignUpParams
	): Promise<ConfirmSignUpResult> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].confirmSignUp(confirmSignUpParams);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public confirmSignIn(
		confirmSignInParams: ConfirmSignInParams
	): Promise<SignInResult> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].confirmSignIn(confirmSignInParams);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public signOut(): Promise<void> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].signOut();
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public fetchSession(): Promise<AmplifyUser> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].fetchSession();
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public addAuthenticator(): Promise<AddAuthenticatorResponse> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].addAuthenticator();
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public requestScope(scope: string): Promise<RequestScopeResponse> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].requestScope(scope);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}

	public authorize(
		authorizationOptions: AuthZOptions
	): Promise<AuthorizationResponse> {
		if (this._pluggables.length > 0) {
			return this._pluggables[0].authorize(authorizationOptions);
		}

		throw new Error(
			'Missing plugin, do you have Auth.addPluggable or Amplify.addPluggable on your code?'
		);
	}
}

export const AuthPluggable = new AuthPlugClass();
Amplify.register(AuthPluggable);
