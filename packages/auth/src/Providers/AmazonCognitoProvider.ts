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
	getAmplifyUserAgent
} from '@aws-amplify/core';
import { 
	AuthOptions, 
	AuthPluginOptions, 
	AuthSignInResult, 
	AuthSignInStep, 
	AuthSignUpResult, 
	AuthSignUpStep, 
	AuthUserAttributeKey, 
	AutoSignInOptions, 
	ClientMetaData, 
	CognitoSignUpOptions, 
	CognitoUserAttributeKey, 
	DeliveryMedium, 
	SignUpRequest, 
	ValidationData 
} from '../types/AmazonCognitoProvider';
import { AuthProvider } from '../types/AuthProvider';
import { 
	AuthFlowType,  
	CognitoIdentityProviderClient, 
	InitiateAuthCommand, 
	SignUpCommand, 
	SignUpCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthEventPayloadMap, AuthHubEvent } from '../types/hubEvents';
import { AuthError, authErrorMessages, ErrorInterface } from '../Errors';
import { createCognitoIdentityProviderClient, mapChallengeNames } from '../common/CognitoIdentityProviderClientUtils';

const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

const MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;

const logger = new Logger('AmazonCognitoProvider');

const dispatchAuthEvent = <T extends AuthHubEvent, UserAttributeKey extends AuthUserAttributeKey>(
	event: T,
	data: AuthEventPayloadMap<UserAttributeKey>[T]['data'],
	message: AuthEventPayloadMap<UserAttributeKey>[T]['message']
  ) => {
	Hub.dispatch('auth', {event, data, message}, 'Auth', AMPLIFY_SYMBOL);
  };

export class AmazonCognitoProvider implements AuthProvider {
	static category = 'Auth';
	static providerName = 'AmazonCognito';

	private _config: AuthOptions;
	private client: CognitoIdentityProviderClient;
	private _storage: any;
	private autoSignInInitiated = false;

	constructor(config?) {
		this._config = config ? config : {};
		this._storage = this._config.storage;
		this.client = createCognitoIdentityProviderClient(config);
	}

	async signUp<PluginOptions extends AuthPluginOptions = CognitoSignUpOptions>(req: SignUpRequest<CognitoUserAttributeKey, PluginOptions>): Promise<AuthSignUpResult<CognitoUserAttributeKey>> {
		if (!this._config?.userPoolId) {
			this.rejectNoUserPool();
		}
		const clientId = this._config.userPoolId ?? '';
		const username: string = req.username;
		const password: string = req.password;

		if (!username) {
			throw new AuthError({message: authErrorMessages.emptyUsername.message});
		}

		if (!password) {
			throw new AuthError({message: authErrorMessages.emptyPassword.message})
		}

		const signUpCommandInput: SignUpCommandInput = {
			ClientId: clientId,
			Username: username,
			Password: password,
		};

		if (req.options?.userAttributes) {
			signUpCommandInput.UserAttributes = req.options.userAttributes.map(obj => ({
				Name: obj.userAttributeKey,
				Value: obj.value
			}));
		}

		if (req.options?.pluginOptions) {
			const pluginOptions = req.options.pluginOptions;
			const validationDataObject:ValidationData = pluginOptions['ValidationData'];
			if (validationDataObject) {
				signUpCommandInput.ValidationData = Object.entries(validationDataObject).map(([key, value]) => ({
					Name: key,
					Value: value
				}));
			}
			const clientMetaData: Record<string, string> = pluginOptions['clientMetaData'];
			if (clientMetaData) {
				signUpCommandInput.ClientMetadata = clientMetaData;
			}
		}

		let autoSignIn: AutoSignInOptions = { enabled: false };
		let autoSignInClientMetaData: ClientMetaData = {};

		if (req.options?.autoSignIn?.enabled) {
			autoSignIn = req.options.autoSignIn;
			// this._storage.setItem('amplify-auto-sign-in', 'true'); // TODO uncomment when storage is implemented in config
			autoSignInClientMetaData = autoSignIn.clientMetaData ?? {};
		}

		try {
			const signUpCommandOutput = await this.client.send(new SignUpCommand(signUpCommandInput));
			let result: AuthSignUpResult<CognitoUserAttributeKey>;
			if (signUpCommandOutput.UserConfirmed) {
				result = {
					isSignUpComplete: true,
					nextStep: {
						signUpStep: AuthSignUpStep.DONE
					}
				};
				dispatchAuthEvent(
					AuthHubEvent.SIGN_UP,
					{
						response: result,
						user: null
					},
					`${username} has signed up successfully`
				);
			} else {
				result = {
					isSignUpComplete: false,
					nextStep: {
						signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
						codeDeliveryDetails: {
							deliveryMedium: signUpCommandOutput.CodeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
							destination: signUpCommandOutput.CodeDeliveryDetails?.Destination as string,
							attributeName: signUpCommandOutput.CodeDeliveryDetails?.AttributeName as CognitoUserAttributeKey
						}
					}
				};
				dispatchAuthEvent(
					AuthHubEvent.SIGN_UP,
					{
						response: result,
						user: null
					},
					`${username} has signed up successfully`
				);
			}
			if (autoSignIn.enabled) {
				this.handleAutoSignIn(username, password, clientId, autoSignInClientMetaData, result.isSignUpComplete);
			}
			return result;
		} catch (error) {
			dispatchAuthEvent(
				AuthHubEvent.SIGN_UP_FAILURE,
				error,
				`${username} failed to sign-up`
			);
			throw error;
		}
	}

	private async handleAutoSignIn(
		username: string,
		password: string,
		clientId: string,
		clientMetaData: ClientMetaData,
		isSignUpComplete: boolean
	) {
		this.autoSignInInitiated = true;
		const initiateAuthCommand = new InitiateAuthCommand({
			AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
			AuthParameters: {
				username,
				password
			},
			ClientId: clientId,
			ClientMetadata: clientMetaData
		});

		if (isSignUpComplete) {
			await this.signInAfterUserConfirmed(initiateAuthCommand, username);
		} else if (this._config.signUpVerificationMethod === 'link') {
			await this.handleLinkAutoSignIn(initiateAuthCommand, username);
		} else {
			await this.handleCodeAutoSignIn(initiateAuthCommand, username);
		}

	}

	private async signInAfterUserConfirmed(
		initiateAuthCommand: InitiateAuthCommand,
		username: string,
		autoSignInPollingIntervalId?: ReturnType<typeof setInterval>
	) {
		try {
			const result = await this.client.send(initiateAuthCommand);
			let authSignInResult: AuthSignInResult<CognitoUserAttributeKey>;

			if (result.AuthenticationResult) {
				authSignInResult = {
					isSignedIn: true,
					nextStep: {
						signInStep: AuthSignInStep.DONE
					}
				};
			} else {
				const challengeName = result.ChallengeName ?? '';
				authSignInResult = {
					isSignedIn: false,
					nextStep: {
						signInStep: mapChallengeNames(challengeName)
					}
				};
			}

			dispatchAuthEvent(
				AuthHubEvent.AUTO_SIGN_IN,
				{
					response: authSignInResult,
					user: null
				},
				`${username} has signed in successfully`
			);

			if (autoSignInPollingIntervalId) {
				clearInterval(autoSignInPollingIntervalId);
				// this._storage.removeItem('amplify_polling_started'); // TODO: uncommnet when storage is implemented in configure
			}

			// this._storage.removeItem('amplify-auto-sign-in'); // TODO uncomment when storage is implemented in configure
		} catch (error) {
			logger.error(error);
		}
		
	}

	private handleLinkAutoSignIn(initiateAuthCommand: InitiateAuthCommand, username: string) {
		// this._storage.setItem('amplify-polling-started', 'true'); // TODO uncomment when storage is implemented in config
		const start = Date.now();
		const autoSignInPollingIntervalId = setInterval(() => {
			if (Date.now() - start > MAX_AUTOSIGNIN_POLLING_MS) {
				clearInterval(autoSignInPollingIntervalId);
				dispatchAuthEvent(
					AuthHubEvent.AUTO_SIGN_IN_FAILURE,
					new AuthError({message: authErrorMessages.autoSignInError.message}),
					'autoSignIn has failed'
				);
			} else {
				this.signInAfterUserConfirmed(initiateAuthCommand, username, autoSignInPollingIntervalId);
			}
		}, 5000);

	}

	private handleCodeAutoSignIn(initiateAuthCommand: InitiateAuthCommand, username: string) {
		const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
			if (payload.event === 'confirmSignUp') {
				await this.signInAfterUserConfirmed(initiateAuthCommand, username);
				hubListenerCancelToken();
			}
		});
	}

	private rejectNoUserPool(): Promise<never> {
		const noUserPoolError = this.noUserPoolErrorHandler(this._config);
		throw new AuthError(noUserPoolError);
	}

	private noUserPoolErrorHandler(config: AuthOptions): ErrorInterface {
		if (config) {
			if (!config.userPoolId || !config.identityPoolId) {
				return {
					message: authErrorMessages.missingAuthConfig.message,
				};
			}
		}
		return { message: authErrorMessages.noConfig.message };
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
