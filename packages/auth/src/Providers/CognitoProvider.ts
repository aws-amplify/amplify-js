import {
	AddAuthenticatorResponse,
	AmplifyUser,
	AuthorizationResponse,
	AuthProvider,
	AuthZOptions,
	ConfirmSignInParams,
	ConfirmSignUpParams,
	PluginConfig,
	RequestScopeResponse,
	SignInParams,
	SignInResult,
	SignUpParams,
	SignUpResult,
} from '../types';

import { dispatchAuthEvent } from './Util';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('CognitoProvider');

type CognitoConfig = {
	userPoolId: string;
	region: string;
};

export class CognitoProvider implements AuthProvider {
	static readonly CATEGORY = 'Auth';
	static readonly PROVIDER_NAME = 'CognitoProvider';
	_config: CognitoConfig;
	configure(config: PluginConfig) {
		logger.debug(
			`Configuring provider with ${JSON.stringify(config, null, 2)}`
		);
		if (!config.userPoolId || !config.region) {
			throw new Error(`Invalid config for ${this.getProviderName()}`);
		}
		this._config = {
			userPoolId: config.userPoolId,
			region: config.region,
		};
	}
	getCategory(): string {
		return CognitoProvider.CATEGORY;
	}
	getProviderName(): string {
		return CognitoProvider.PROVIDER_NAME;
	}
	signUp(params: SignUpParams): Promise<SignUpResult> {
		throw new Error('Method not implemented.');
	}
	confirmSignUp(params: ConfirmSignUpParams): Promise<SignUpResult> {
		throw new Error('Method not implemented.');
	}
	signIn(params: SignInParams): Promise<SignInResult> {
		if (!this.isConfigured()) {
			throw new Error('Plugin not configured');
		}

		throw new Error('Cagamos');
	}
	confirmSignIn(params: ConfirmSignInParams): Promise<SignInResult> {
		throw new Error('Method not implemented.');
	}
	fetchSession(): Promise<AmplifyUser> {
		throw new Error('Method not implemented.');
	}
	addAuthenticator(): Promise<AddAuthenticatorResponse> {
		throw new Error('Method not implemented.');
	}
	requestScope(scope: string): Promise<RequestScopeResponse> {
		throw new Error('Method not implemented.');
	}
	authorize(
		authorizationOptions: AuthZOptions
	): Promise<AuthorizationResponse> {
		throw new Error('Method not implemented.');
	}
	signOut(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	isConfigured() {
		return this._config.userPoolId && this._config.region;
	}
}
