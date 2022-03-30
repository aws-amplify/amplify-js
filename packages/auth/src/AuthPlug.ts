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
	ICredentials,
	Parser,
} from '@aws-amplify/core';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { AWSCognitoProvider } from './Providers';
import {
	UsernamePasswordOpts,
	SignUpParams,
	CurrentUserOpts,
	SignOutOpts,
} from './types';
import { AuthProvider } from './types/Provider';

const logger = new Logger('AuthClass');

const DEFAULT_PROVIDER = 'AWSCognito';

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

	private findProvider(config?) {
		const provider = config?.provider || DEFAULT_PROVIDER;
		const prov = this._pluggables.find(
			pluggable => pluggable.getProviderName() === provider
		);

		return prov;
	}

	public getModuleName() {
		return 'Auth' as const;
	}

	/**
	 * Add plugin into Auth category
	 * @param {Object} pluggable - an instance of the plugin
	 */
	public addPluggable(pluggable: AuthProvider) {
		if (pluggable && pluggable.getCategory() === 'Auth') {
			this._pluggables.push(pluggable);
			let config = {};

			config = pluggable.configure(this._config);

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
	public configure(config?) {
		console.log('configure auth plug');
		logger.debug('configuring Auth', config);
		if (!config || !Object.keys(config).length) return this._config;

		this._config = Object.assign(
			{},
			this._config,
			Parser.parseMobilehubConfig(config).Auth,
			config
		);

		this._pluggables.forEach(pluggable => {
			pluggable.configure(this._config[pluggable.getProviderName()]);
		});

		if (this._pluggables.length === 0) {
			this.addPluggable(new AWSCognitoProvider(this._config));
		}

		dispatchAuthEvent(
			'configured',
			null,
			`The Auth category has been configured successfully`
		);
		logger.debug('current configuration', this._config);
		return this._config;
	}

	public async signIn(
		usernameOrSignInOpts: string | UsernamePasswordOpts,
		pw?: string,
		clientMetadata?: { [key: string]: string },
		config?: any
	): Promise<CognitoUser | any> {
		const prov = this.findProvider(config);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', config?.provider);
			return Promise.reject('No plugin found ');
		}

		const signInResponse = prov.signIn(
			usernameOrSignInOpts,
			pw,
			clientMetadata
		);

		return signInResponse;
	}

	public async currentUserPoolUser(
		params?: CurrentUserOpts,
		config?: any
	): Promise<CognitoUserSession> {
		const prov = this.findProvider(config);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', config?.provider);
			//@ts-ignore
			return Promise.reject('No plugin found');
		}

		return prov.currentUserPoolUser(params);
	}
	public async currentSession(config?): Promise<CognitoUserSession> {
		const prov = this.findProvider(config);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', config?.provider);
			//@ts-ignore
			return Promise.reject('No plugin found');
		}

		return prov.currentSession();
	}
	public async getCreds(config?): Promise<ICredentials> {
		const prov = this.findProvider(config);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', config?.provider);
			//@ts-ignore
			return Promise.reject('No plugin found');
		}

		// configure find provider
		logger.debug('getting current credentials');
		return prov.getCreds();
	}
	public async signOut(opts: SignOutOpts, config?: any) {
		const prov = this.findProvider(config);

		if (prov === undefined) {
			logger.debug('No plugin found with providerName', config?.provider);
			return Promise.reject('No plugin found ');
		}

		const signOutResponse = prov.signOut(opts);

		return signOutResponse;
	}
}

export const AuthPlug = new AuthPlugClass();
Amplify.register(AuthPlug);
