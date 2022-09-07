/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

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
	SOCIAL_PROVIDER,
} from '../../types';
import {
	CognitoIdentityProviderClient,
	GetUserCommand,
	AuthFlowType,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClient,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import { dispatchAuthEvent, decodeJWT, getExpirationTimeFromJWT } from './Util';
import { Hub, Logger, StorageHelper } from '@aws-amplify/core';
import { interpret, ActorRefFrom, StateMachine, Interpreter } from 'xstate';
import { inspect } from '@xstate/inspect';
import { waitFor } from 'xstate/lib/waitFor';
import {
	AuthenticationEvents,
	authenticationMachine,
	authenticationMachineEvents,
} from './machines/authenticationMachine';
import {
	authorizationMachine,
	authorizationMachineEvents,
} from './machines/authorizationMachine';
import {
	AuthEvents,
	authMachine,
	authMachineEvents,
} from './machines/authMachine';
import { signInMachine, signInMachineEvents } from './machines/signInMachine';
import {
	AWSCredsRes,
	UserPoolTokens,
} from './types/machines/authorizationMachine';
import { Session } from 'inspector';
import {
	AuthenticationMachineContext,
	AuthenticationTypeState,
} from './types/machines/authenticationMachine';
import { CognitoConfirmSignInPluginOptions } from './types/model';
import { CognitoSignUpPluginOptions } from './types/model/signup/CognitoSignUpPluginOptions';
import { AWSCredentials } from './types/model/session/AWSCredentials';
import { AmplifyCognitoUser } from './types/model/user/CognitoUser';

export { AWSCredentials } from './types/model/session/AWSCredentials';

const logger = new Logger('CognitoProvider');

const COGNITO_CACHE_KEY = '__cognito_cached_tokens';

export type CognitoChallenge =
	| 'SMS_MFA'
	| 'SELECT_MFA_TYPE'
	| 'MFA_SETUP'
	| 'SOFTWARE_TOKEN_MFA'
	| 'CUSTOM_CHALLENGE'
	| 'NEW_PASSWORD_REQUIRED'
	| 'DEVICE_SRP_AUTH'
	| 'DEVICE_PASSWORD_VERIFIER'
	| 'ADMIN_NOSRP_AUTH';

export type CognitoProviderOAuthConfig = {
	oauth?: {
		domain: string;
		scope: string[];
		redirectSignIn: string;
		redirectSignOut: string;
		responseType: string;
		options?: object;
		urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
	};
};

export type CognitoProviderConfig = {
	userPoolId: string;
	clientId: string;
	region: string;
	storage?: Storage;
	identityPoolId?: string;
	clientMetadata?: { [key: string]: string };
} & CognitoProviderOAuthConfig;

// FOR DEBUGGING/TESTING
function listenToAuthHub(send: any) {
	return Hub.listen('auth', data => {
		send(data.payload.event);
	});
}

export class CognitoProvider implements AuthProvider {
	static readonly CATEGORY = 'Auth';
	static readonly PROVIDER_NAME = 'CognitoProvider';
	private _authService: any;
	private _authnService: any;
	private _authzService: any;
	// private _authnService = interpret(authenticationMachine, {
	// 	devTools: true,
	// }).start();
	// private _authzService = interpret(authorizationMachine, {
	// 	devTools: true,
	// }).start();

	private _config: CognitoProviderConfig;
	private _userStorage: Storage;
	// TODO: we should do _storageSync where it should for React Native
	private _storageSync: Promise<void> = Promise.resolve();
	// For the purpose of prototyping / testing it we are using plain username password flow for now
	private _authFlow = AuthFlowType.USER_PASSWORD_AUTH;

	constructor(config: PluginConfig) {
		this._config = config ?? {};
		this._userStorage = config.storage ?? new StorageHelper().getStorage();
		// listenToAuthHub(this._authnService.send);
		// @ts-ignore ONLY FOR DEBUGGING AND TESTING!
		window.Hub = Hub;
		// this._authnService.subscribe(state => {});
	}

	configure(config: PluginConfig) {
		logger.debug(
			`Configuring provider with ${JSON.stringify(config, null, 2)}`
		);
		console.log('hello!');

		if (!config.userPoolId || !config.region) {
			throw new Error(`Invalid config for ${this.getProviderName()}`);
		}
		this._config = {
			userPoolId: config.userPoolId,
			region: config.region,
			clientId: config.clientId,
			identityPoolId: config.identityPoolId,
			oauth: config.oauth,
		};
		if (config.storage) {
			this._userStorage = config.storage;
		}
		this._authService = interpret(authMachine, { devTools: true }).start();

		this._authService.send(authMachineEvents.configureAuth(this._config));

		debugger;
		waitFor(this._authService, state => state.matches('configured')).then(
			() => {
				const { authenticationActorRef, authorizationActorRef } =
					this._authService.state.context;
				this._authnService = authenticationActorRef as ActorRefFrom<
					typeof authenticationMachine
				>;
				this._authzService = authorizationActorRef as ActorRefFrom<
					typeof authorizationMachine
				>;

				logger.debug('provider configured');
			}
		);

		// this._authnService.send(
		// 	authenticationMachineEvents.configure(this._config)
		// );
		// // this._authzService.send(authorizationMachineEvents.configure(this._config));
		// console.log('successfully configured cognito provider');
		// if (this._handlingOAuthCodeResponse()) {
		// 	// wait for state machine to finish transitioning to signed out state
		// 	waitFor(this._authnService, state => state.matches('configured')).then(
		// 		() => {
		// 			this._authnService.send(
		// 				authenticationMachineEvents.signInRequested({
		// 					signInType: 'Social',
		// 				})
		// 			);
		// 		}
		// 	);
		// }
	}

	private _handlingOAuthCodeResponse(): boolean {
		if (typeof window === undefined) return false;
		const url = new URL(window.location.href);
		return url.search.substr(1).startsWith('code');
	}

	getCategory(): string {
		return CognitoProvider.CATEGORY;
	}
	getProviderName(): string {
		return CognitoProvider.PROVIDER_NAME;
	}
	async signUp(
		params: SignUpParams<CognitoSignUpPluginOptions>
	): Promise<SignUpResult> {
		//TODO implement state machine call
		return {} as SignUpResult;
	}
	async confirmSignUp(params: ConfirmSignUpParams): Promise<SignUpResult> {
		//TODO implement state machine call
		return {} as SignUpResult;
	}
	private isAuthenticated() {
		// TODO: should also check if token has expired?
		return this._authnService.state.matches('signedIn');
	}

	async signIn(
		params: SignInParams & { password?: string }
	): Promise<SignInResult> {
		// var signInMachine = this._authService.children.get(
		// 	'authenticationMachine'
		// ) as Interpreter<AuthenticationMachineContext>;

		// const { authenticationActorRef } = this._authService.state.context;
		// const signInMachine = authenticationActorRef as ActorRefFrom<
		// 	typeof authenticationMachine
		// >;

		if (this._authnService.state.matches('notConfigured')) {
			throw new Error('AuthN is not configured');
		}
		// TODO: implement the other sign in method
		if (params.signInType === 'Link' || params.signInType === 'WebAuthn') {
			throw new Error('Not implemented');
		}
		// throw error if user is already signed in
		// NOTE: the state machine should probably already know we are authenticated
		if (this.isAuthenticated()) {
			throw new Error(
				'User is already authenticated, please sign out the current user before signing in.'
			);
		}
		// kick off the sign in request
		this._authnService.send(
			authenticationMachineEvents.signInRequested({
				...params,
				signInFlow: this._authFlow,
			})
		);
		this._authzService.send(authorizationMachineEvents.signInRequested());
		const signInResult = await this.waitForSignInComplete();

		return signInResult;
	}

	private async waitForSignInComplete(): Promise<SignInResult> {
		const { authenticationActorRef } = this._authService.state.context;
		const authenticationService = authenticationActorRef as ActorRefFrom<
			typeof authenticationMachine
		>;
		const signingInState = await waitFor(authenticationService, state =>
			state.matches('signingIn')
		);
		const { actorRef } = signingInState.context;
		if (actorRef) {
			const signInActorRef = actorRef as ActorRefFrom<typeof signInMachine>;
			// DEBUGGING
			signInActorRef.subscribe(state => {
				console.log('actorRef state :', state);
			});
			// TODO: Can I refactor signInMachine or the main AuthMachine state to avoid using Promise.race?
			await Promise.race([
				waitFor(
					authenticationService,
					state => state.matches('signedIn') || state.matches('error')
				),
				waitFor(signInActorRef, state => state.matches('nextAuthChallenge')),
			]);
			// if it reaches error state, throw the caught error
			if (authenticationService.state.matches('error')) {
				throw authenticationService.state.context.error;
			}
			return {
				signInSuccesful: authenticationService.state.matches('signedIn'),
				nextStep: signInActorRef.state.matches('nextAuthChallenge'),
			};
		}
		return { signInSuccesful: false, nextStep: false };
	}

	async confirmSignIn(
		params: ConfirmSignInParams<CognitoConfirmSignInPluginOptions>
	): Promise<SignInResult> {
		console.log('confirm signin');
		if (
			params.pluginOptions!.challengeName !== ChallengeNameType.SMS_MFA &&
			params.pluginOptions!.challengeName !==
				ChallengeNameType.SOFTWARE_TOKEN_MFA &&
			params.pluginOptions!.challengeName !==
				ChallengeNameType.NEW_PASSWORD_REQUIRED
		) {
			throw new Error('Not implemented');
		}
		const { actorRef } = this._authnService.state.context;
		if (!actorRef || !this._authnService.state.matches('signingIn')) {
			throw new Error(
				'Sign in proccess has not been initiated, have you called .signIn?'
			);
		}
		const signInActorRef = actorRef as ActorRefFrom<typeof signInMachine>;
		signInActorRef.send(
			// @ts-ignore
			signInMachineEvents.respondToAuthChallenge({
				...params,
			})
		);
		return await this.waitForSignInComplete();
	}

	isSigningIn() {
		return this._authnService.state.matches('signedIn');
	}

	async completeNewPassword(
		newPassword: string,
		requiredAttributes?: { [key: string]: any }
	): Promise<SignInResult> {
		if (!newPassword) {
			throw new Error('New password is required to do complete new password');
		}
		const { actorRef } = this._authnService.state.context;
		if (!actorRef || !this.isSigningIn()) {
			throw new Error(
				'Sign in proccess has not been initiated, have you called .signIn?'
			);
		}
		const signInActorRef = actorRef as ActorRefFrom<typeof signInMachine>;
		signInActorRef.send(
			signInMachineEvents.respondToAuthChallenge({
				challengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
				newPassword,
				requiredAttributes,
			})
		);
		return await this.waitForSignInComplete();
	}

	private getCachedUserpoolTokens():
		| {
				accessToken: string;
				idToken: string;
				refreshToken: string;
		  }
		| undefined {
		if (typeof this._userStorage.getItem(COGNITO_CACHE_KEY) === 'string') {
			return JSON.parse(this._userStorage.getItem(COGNITO_CACHE_KEY) as string);
		}
	}

	private isUserPoolTokensExpired(bufferTime?: number) {
		const userpoolTokens = this.getCachedUserpoolTokens();
		if (!userpoolTokens) {
			throw new Error('cannot find cached JWT tokens');
		}
		const { exp: idTokenExpiration } = decodeJWT(userpoolTokens.idToken);
		const { exp: accessTokenExpiration } = decodeJWT(
			userpoolTokens.accessToken
		);
		return (
			Date.now() / 1000 > idTokenExpiration ||
			Date.now() / 1000 > accessTokenExpiration
		);
	}

	private isSessionExpired(bufferTime?: number) {
		// check to make sure state machine is in the session established state
		if (!this._authzService.state.matches('sessionEstablished')) {
			return false;
		}
		// gets the session information from the context of the state machine (should be stored there from previous run)
		const sessionInfo = this._authzService.state.context.sessionInfo;
		const awsCredentials = this.shearAWSCredentials(sessionInfo.AWSCredentials);
		const now = new Date();
		const isSignedIn = this._authnService.state.matches('signedIn');
		// check to see if tokens are expired depending on whether or not the user is signed in
		// if a user is signed in, we also have to check if jwt tokens are expired on top of aws credentials
		if (isSignedIn) {
			return this.isUserPoolTokensExpired() || now > awsCredentials.expiration;
		} else {
			return now > awsCredentials.expiration;
		}
	}

	async fetchSession(): Promise<AmplifyUser> {
		// checks to see if the identity pool and region are already configured
		// 1. if AuthZ machine is not configured -> throw error
		if (this._authzService.state.matches('notConfigured')) {
			throw new Error(
				'Identity Pool and Userpool have not been configured yet.'
			);
			// 2. else if AuthZ machine is in 'configured' state
			//   -> that means session has not been established
			//   -> that means we need to fetch either auth or unauth
			//     -> check authN machine
			//     -> if authN already at signedIn state, send a signInRequested ---> signInCompleted event to AuthZ machine
			//     -> wait for 'sessionEstablished' state
			//     -> grab sessionInfo from the AuthZ state machine
		} else if (this._authzService.state.matches('configured')) {
			if (this._authnService.state.matches('signedIn')) {
				// getting jwt from localStorage after user signed in
				const userpoolTokens = this.getCachedUserpoolTokens();
				if (!userpoolTokens) {
					throw new Error('Session data is not cached in the localStorage.');
				}
				// send userpool tokens to the authz machine so it can fetch auth session
				this._authzService.send(
					authorizationMachineEvents.signInCompleted({ ...userpoolTokens })
				);
			} else {
				// fetch un auth session if the authN state machine is not in the signed in state
				this._authzService.send(
					authorizationMachineEvents.fetchUnAuthSession()
				);
			}
			// 3. else if AuthZ machine is in 'sessionEstablished' state
			//   -> session has already been established
			//   -> check if creds is unauth or auth
			//   -> check the token / AWS creds expiration
			//   -> if any of them expired, invoke the refreshSessionMachine
			//   -> wait for 'sessionEstablished' state
			//   -> grab session Info from the authZ state machine
		} else if (this._authzService.state.matches('sessionEstablished')) {
			logger.debug('we have cached session here');
			// check expiration here
			if (this.isSessionExpired()) {
				// run the refresh session state machine if the session is expired
				this._authzService.send(
					authorizationMachineEvents.refreshSession(
						this.getCachedUserpoolTokens()
					)
				);
			}
			// 4a. else if AuthZ machine is in 'signingIn' state
			//   -> that means user called signIn, but hasn't called fetchSession after that
			//   ** we assume the user wait for the signIn call to complete, before they do a fetchSession
			//   -> check AuthN machine if it's in the 'signedIn' state
			//     -> Yes
			//     -> send 'signInCompleted' event
			//     -> wait for 'sessionEstablished' state
			//     -> grab session Info from authZ state machine
		} else if (this._authzService.state.matches('signingIn')) {
			if (this._authnService.state.matches('signedIn')) {
				const userpoolTokens = this.getCachedUserpoolTokens();
				if (!userpoolTokens) {
					throw new Error('Session data is not cached in the localStorage.');
				}
				this._authzService.send(
					authorizationMachineEvents.signInCompleted({ ...userpoolTokens })
				);
			}
		} else if (
			[
				'refreshingSession',
				'fetchingUnAuthSession',
				'fetchAuthSessionWithUserPool',
			].some(this._authzService.state.matches)
		) {
			// do nothing.. wait for the sessionEstablished state
		}
		//  OR
		//  4b. We change the .signIn call
		//    -> signIn
		//      -> send 'signInRequested' to both AuthN and AuthZ
		//      -> wait for AuthN to go into the 'signedIn' state
		//      -> send 'signInCompleted' to AuthZ
		//    -> resolve .signIn promise
		//  so, now AuthZ machine will either be in the 'fetchAuthSessionWithUserPool'
		//    or
		//      already at 'sessionEstablished' state (which is handled in 1.)
		// -> return the user session info
		else {
			throw new Error('Invalid state');
		}
		return this.waitForSessionEstablished();
	}

	private async waitForSessionEstablished(): Promise<AmplifyUser> {
		// make sure session is established before trying to get the tokens out of the context
		const sessionEstablishedState = await waitFor(this._authzService, state =>
			state.matches('sessionEstablished')
		);
		const isSignedIn = this._authnService.state.matches('signedIn');
		// getting aws credentials from the context of the state machine if available
		const sessionInfo = sessionEstablishedState.context.sessionInfo;
		let awsCredentials: AWSCredentials | null;
		try {
			awsCredentials = this.shearAWSCredentials(sessionInfo.AWSCredentials);
		} catch (err) {
			awsCredentials = null;
		}

		// assign aws credentials to the session
		const userpoolTokens = this.getCachedUserpoolTokens();
		const amplifyUser: AmplifyCognitoUser = {
			isSignedIn,
			credentials: {
				default: {
					...(awsCredentials && { aws: awsCredentials }),
				},
			},
		};
		// if the user is signed in, assign jwt tokens as well
		// if not, return the session without jwt tokens
		if (isSignedIn) {
			if (!userpoolTokens) {
				throw new Error('cached jwt tokens not available');
			}
			amplifyUser.credentials!.default.jwt = {
				accessToken: userpoolTokens.accessToken,
				idToken: userpoolTokens.idToken,
				refreshToken: userpoolTokens.refreshToken,
			};
			const { sub } = decodeJWT(userpoolTokens.idToken);
			amplifyUser.userInfo = { userid: sub as string };
		}
		return amplifyUser;
	}

	private shearAWSCredentials(res: AWSCredsRes): AWSCredentials {
		if (!res) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		const { AccessKeyId, SecretKey, SessionToken, Expiration } = res;
		return {
			accessKeyId: AccessKeyId,
			secretAccessKey: SecretKey,
			sessionToken: SessionToken,
			expiration: Expiration,
		};
	}
	async refreshSession(): Promise<AmplifyUser> {
		// check to make sure authorization state machine is in the session established state or throw an error
		if (
			!this._authzService.state.matches('sessionEstablished') &&
			!this._authzService.state.matches('refreshingSession')
		) {
			throw new Error(
				'Session should be established before calling .refreshSession, please call .fetchSession first'
			);
		}
		// check to make sure there is a refresh token present (must be an auth session not UnAuth session)
		const userpoolTokens = this.getCachedUserpoolTokens();
		// call refreshSession state machine and pass refresh token as the argument/context
		// for the state machine to use as an argument to the service class
		this._authzService.send(
			authorizationMachineEvents.refreshSession(userpoolTokens, true)
		);
		// return new userpool tokens and update the ones in storage if necessary
		return this.waitForSessionEstablished();
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
	async signOut(): Promise<void> {
		const { authenticationActorRef } = this._authService.state.context;
		const signInMachine = authenticationActorRef as ActorRefFrom<
			typeof authenticationMachine
		>;

		this.clearCachedTokens();
		signInMachine.send(authenticationMachineEvents.signOutRequested());

		this._authzService.send(authorizationMachineEvents.signOutRequested());
		dispatchAuthEvent(
			'signOut',
			{ placeholder: 'placeholder' },
			'A user has been signed out'
		);
		return Promise.resolve();
	}

	private isConfigured(): boolean {
		return (
			Boolean(this._config?.userPoolId) &&
			Boolean(this._config?.region) &&
			Boolean(this._config?.identityPoolId)
		);
	}

	// TODO: remove this, should live inside the AuthZ machine
	private clearCachedTokens() {
		this._userStorage.removeItem(COGNITO_CACHE_KEY);
	}

	// TODO: remove this, should use CognitoService class
	private createNewCognitoClient(config: {
		region?: string;
	}): CognitoIdentityProviderClient {
		const cognitoIdentityProviderClient = new CognitoIdentityProviderClient(
			config
		);
		return cognitoIdentityProviderClient;
	}

	// TODO: remove this, should use CognitoService class
	private createNewCognitoIdentityClient(config: {
		region?: string;
	}): CognitoIdentityClient {
		const cognitoIdentityClient = new CognitoIdentityClient(config);
		return cognitoIdentityClient;
	}

	// isAWSCredentials(
	// 	authResponse: AuthorizationResponse
	// ): authResponse is AWSCredentials {
	// 	return (
	// 		authResponse &&
	// 		!!Object.keys(authResponse).find(k => k === 'accessKeyId') &&
	// 		!!Object.keys(authResponse).find(k => k === 'secretAccessKey') &&
	// 		!!Object.keys(authResponse).find(k => k === 'sessionToken') &&
	// 		!!Object.keys(authResponse).find(k => k === 'expiration')
	// 	);
	// }
}
