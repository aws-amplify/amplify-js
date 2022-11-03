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
	JS,
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
	AttributeType, 
	AuthFlowType, 
	ChallengeNameType, 
	CognitoIdentityProviderClient, 
	InitiateAuthCommand, 
	SignUpCommand, 
	SignUpCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthEventPayloadMap, AuthHubEvent } from '../types/hubEvents';
import { AuthError, authErrorMessages, ErrorInterface } from '../Errors';

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
	private userPool;
	private client: CognitoIdentityProviderClient;
	private _storage;
	private autoSignInInitiated = false;

	constructor(config?) {
		this._config = config ? config : {};
		this._storage = this._config.storage;
		this.client = new CognitoIdentityProviderClient({ region: config.region });
	}

	signUp<UserAttributeKey extends AuthUserAttributeKey = CognitoUserAttributeKey,
	PluginOptions extends AuthPluginOptions = CognitoSignUpOptions>(req: SignUpRequest<UserAttributeKey, PluginOptions>): Promise<AuthSignUpResult<UserAttributeKey>> {
		if (!this._config?.userPoolId) {
			this.rejectNoUserPool();
		}

		const clientId = this._config.userPoolId ?? "";
		const username: string = req.username;
		const password: string = req.password;

		if (!username) {
			this.rejectAuthError(authErrorMessages.emptyUsername);
		}

		if (!password) {
			this.rejectAuthError(authErrorMessages.emptyPassword);
		}

		let attributes: AttributeType[];
		let validationData: AttributeType[];
		let clientMetaData: Record<string, string>;
		let autoSignIn: AutoSignInOptions = { enabled: false };
		let autoSignInClientMetaData: ClientMetaData = {};

		let signUpCommandInput: SignUpCommandInput = {
			ClientId: clientId,
			Username: username,
			Password: password,
		};

		if (req.options?.userAttributes) {
			const userAttributesArray = req.options.userAttributes;
			attributes = [];
			userAttributesArray.forEach(obj => {
				attributes.push({
					Name: obj.userAttributeKey,
					Value: obj.value
				})
			});
			signUpCommandInput.UserAttributes = attributes;
		}

		if (req.options?.pluginOptions) {
			const pluginOptions = req.options.pluginOptions;
			const validationDataObject:ValidationData = pluginOptions['ValidationData'];
			if (validationDataObject) {
				validationData = [];
				Object.keys(validationDataObject).map(key => {
					validationData.push({
						Name: key,
						Value: validationDataObject[key]
					})
				});
				signUpCommandInput.ValidationData = validationData;
			}
			clientMetaData = pluginOptions['clientMetaData'];
			if (clientMetaData) {
				signUpCommandInput.ClientMetadata = clientMetaData;
			}
		}

		autoSignIn = req.options?.autoSignIn ?? { enabled: false };
		if (autoSignIn.enabled) {
			this._storage.setItem('amplify-auto-sign-in', 'true');
			autoSignInClientMetaData = autoSignIn.clientMetaData ?? {};
		}

		const signUpCommand = new SignUpCommand(signUpCommandInput)

		return new Promise((resolve, reject) => {
			this.client.send(
				signUpCommand,
				(err, data) => {
					if (err) {
						dispatchAuthEvent(
							AuthHubEvent.SIGN_UP_FAILURE,
							err,
							`${username} failed to sign-up`
						);
						reject(err)
					} else {
						let result: AuthSignUpResult<UserAttributeKey>;
						if (data?.UserConfirmed) {
							result = {
								isSignUpComplete: true,
								nextStep: {
									signUpStep: AuthSignUpStep.DONE
								}
							}
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
										deliveryMedium: data?.CodeDeliveryDetails?.DeliveryMedium as DeliveryMedium,
										destination: data?.CodeDeliveryDetails?.Destination as string,
										attributeName: data?.CodeDeliveryDetails?.AttributeName as UserAttributeKey
									}
								}
							}
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
							this.handleAutoSignIn(username, password, clientId, autoSignInClientMetaData, result);
						}
						resolve(result)
					}
				}
			)
		})
	}

	private handleAutoSignIn<UserAttributeKey extends AuthUserAttributeKey>(
		username: string,
		password: string,
		clientId: string,
		clientMetaData: ClientMetaData,
		signUpResult: AuthSignUpResult<UserAttributeKey>
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

		if (signUpResult.isSignUpComplete) {
			this.signInAfterUserConfirmed(initiateAuthCommand, username);
		} else if (this._config.signUpVerificationMethod === 'link') {
			this.handleLinkAutoSignIn(initiateAuthCommand, username);
		} else {
			this.handleCodeAutoSignIn(initiateAuthCommand, username);
		}

	}

	private async signInAfterUserConfirmed<UserAttributeKey extends AuthUserAttributeKey>(
		initiateAuthCommand: InitiateAuthCommand,
		username: string,
		hubListenerRemoveToken?: () => void,
		autoSignInPollingIntervalId?: ReturnType<typeof setInterval>
	) {
		try {
			const result = await this.client.send(initiateAuthCommand);
			let authSignInResult: AuthSignInResult<UserAttributeKey>;

			if (result.AuthenticationResult) {
				authSignInResult = {
					isSignedIn: true,
					nextStep: {
						signInStep: AuthSignInStep.DONE
					}
				}
			} else {
				const challengeName = result.ChallengeName ?? "";
				authSignInResult = {
					isSignedIn: false,
					nextStep: {
						signInStep: this.mapChallengeNames(challengeName)
					}
				}
			}

			dispatchAuthEvent(
				AuthHubEvent.AUTO_SIGN_IN,
				{
					response: authSignInResult,
					user: null
				},
				`${username} has signed in successfully`
			)

			if (hubListenerRemoveToken) {
				hubListenerRemoveToken();
			}

			if (autoSignInPollingIntervalId) {
				clearInterval(autoSignInPollingIntervalId);
				this._storage.removeItem('amplify_polling_started');
			}

			this._storage.removeItem('amplify-auto-sign-in');
		} catch (error) {
			logger.error(error);
		}
		
	}

	private handleLinkAutoSignIn(initiateAuthCommand: InitiateAuthCommand, username: string) {
		this._storage.setItem('amplify-polling-started', 'true');
		const start = Date.now();
		const autoSignInPollingIntervalId = setInterval(() => {
			if (Date.now() - start > MAX_AUTOSIGNIN_POLLING_MS) {
				clearInterval(autoSignInPollingIntervalId);
				dispatchAuthEvent(
					AuthHubEvent.AUTO_SIGN_IN_FAILURE,
					new AuthError({message: authErrorMessages.autoSignInError.message}),
					'autoSignIn has failed'
				)
			} else {
				this.signInAfterUserConfirmed(initiateAuthCommand, username, undefined, autoSignInPollingIntervalId);
			}
		}, 5000);
	}

	private handleCodeAutoSignIn(initiateAuthCommand: InitiateAuthCommand, username: string) {
		const hubListenerCancelToken = Hub.listen('auth', ({ payload }) => {
			if (payload.event === 'confirmSignUp') {
				this.signInAfterUserConfirmed(initiateAuthCommand, username, hubListenerCancelToken);
			}
		})
	}

	private mapChallengeNames(challengeName: string): AuthSignInStep {
		switch(challengeName) {
			// case ChallengeNameType.ADMIN_NO_SRP_AUTH:
			case ChallengeNameType.CUSTOM_CHALLENGE:
				return AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
			// case ChallengeNameType.DEVICE_PASSWORD_VERIFIER:
			// case ChallengeNameType.DEVICE_SRP_AUTH:
			// case ChallengeNameType.MFA_SETUP:
			case ChallengeNameType.NEW_PASSWORD_REQUIRED:
				return AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
			// case ChallengeNameType.PASSWORD_VERIFIER:
			case ChallengeNameType.SELECT_MFA_TYPE:
				return AuthSignInStep.SELECT_MFA_TYPE;
			case ChallengeNameType.SMS_MFA:
				return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE;
			case ChallengeNameType.SOFTWARE_TOKEN_MFA:
				return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE;
			default:
				return AuthSignInStep.DONE;
		}
	}

	private rejectAuthError(type: ErrorInterface): Promise<never> {
		return Promise.reject(new AuthError(type));
	}

	private rejectNoUserPool(): Promise<never> {
		const noUserPoolError = this.noUserPoolErrorHandler(this._config);
		return Promise.reject(new AuthError(noUserPoolError));
	}

	private noUserPoolErrorHandler(config: AuthOptions): ErrorInterface {
		if (config) {
			if (!config.userPoolId || !config.identityPoolId) {
				return {
					message: authErrorMessages.missingAuthConfig.message,
				};
			}
		}
		return { message: authErrorMessages.noConfig.message }
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
