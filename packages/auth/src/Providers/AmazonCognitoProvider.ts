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
import { AuthProvider } from '../types/AuthProvider';

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

	constructor(config?) {
		this._config = config ? config : {};
	}
	signUp(): Promise<any> {
		throw new Error('Method not implemented.');
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
