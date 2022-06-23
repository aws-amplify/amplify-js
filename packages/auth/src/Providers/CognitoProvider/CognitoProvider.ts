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
	AWSCredentials,
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
import { interpret, ActorRefFrom } from 'xstate';
import { inspect } from '@xstate/inspect';
import { waitFor } from 'xstate/lib/waitFor';
import { cognitoSignUp, cognitoConfirmSignUp } from './service';
import {
	authMachine,
	authMachineEvents,
} from './machines/authenticationMachine';
import {
	authzMachine,
	authzMachineEvents,
} from './machines/authorizationMachine';
import { signInMachine, signInMachineEvents } from './machines/signInMachine';
import { access } from 'fs';

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

// For visualization of state diagram
inspect({
	iframe: false,
});

export class CognitoProvider implements AuthProvider {
	static readonly CATEGORY = 'Auth';
	static readonly PROVIDER_NAME = 'CognitoProvider';
	private _authService = interpret(authMachine, { devTools: true }).start();
	private _authzService = interpret(authzMachine, { devTools: true }).start();
	private _config: CognitoProviderConfig;
	private _userStorage: Storage;
	// TODO: we should do _storageSync where it should for React Native
	private _storageSync: Promise<void> = Promise.resolve();
	// For the purpose of prototyping / testing it we are using plain username password flow for now
	private _authFlow = AuthFlowType.USER_PASSWORD_AUTH;

	constructor(config: PluginConfig) {
		this._config = config ?? {};
		this._userStorage = config.storage ?? new StorageHelper().getStorage();
		listenToAuthHub(this._authService.send);
		// @ts-ignore ONLY FOR DEBUGGIN AND TESTING!
		window.Hub = Hub;
		this._authService.subscribe(state => {
			console.log(state);
		});
	}

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
			clientId: config.clientId,
			identityPoolId: config.identityPoolId,
			oauth: config.oauth,
		};
		if (config.storage) {
			this._userStorage = config.storage;
		}
		this._authService.send(authMachineEvents.configure(this._config));
		this._authzService.send(authMachineEvents.configure(this._config));
		console.log('successfully configured cognito provider');
		if (this._handlingOAuthCodeResponse()) {
			// wait for state machine to finish transitioning to signed out state
			waitFor(this._authService, state => state.matches('signedOut')).then(
				() => {
					this._authService.send(
						authMachineEvents.signInRequested({
							signInType: 'Social',
						})
					);
				}
			);
		}
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
	async signUp(params: SignUpParams): Promise<SignUpResult> {
		const signUpRes = cognitoSignUp(
			{
				region: this._config.region,
			},
			{
				...params,
				clientId: this._config.clientId,
			}
		);
		return signUpRes;
	}
	async confirmSignUp(params: ConfirmSignUpParams): Promise<SignUpResult> {
		const { username, confirmationCode } = params;
		try {
			const res = await cognitoConfirmSignUp(
				{
					region: this._config.region,
				},
				{
					clientId: this._config.clientId,
					username,
					confirmationCode,
				}
			);
			console.log(res);
			return res;
		} catch (err) {
			logger.error(err);
			throw err;
		}
	}
	private isAuthenticated() {
		// TODO: should also check if token has expired?
		return this._authService.state.matches('signedIn');
	}

	async signIn(
		params: SignInParams & { password?: string }
	): Promise<SignInResult> {
		if (!this.isConfigured()) {
			throw new Error('Plugin not configured');
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
		this._authService.send(
			authMachineEvents.signInRequested({
				...params,
				signInFlow: this._authFlow,
			})
		);
		// this._authService.send({
		// 	type: 'signInRequested',
		// 	signInEventParams: {
		// 		...params,
		// 		signInFlow: this._authFlow,
		// 	},
		// })
		return await this.waitForSignInComplete();
	}

	private async waitForSignInComplete(): Promise<SignInResult> {
		const authService = this._authService;
		const signingInState = await waitFor(authService, state =>
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
					authService,
					state => state.matches('signedIn') || state.matches('error')
				),
				waitFor(signInActorRef, state => state.matches('nextAuthChallenge')),
			]);
			// if it reaches error state, throw the caught error
			if (authService.state.matches('error')) {
				throw authService.state.context.error;
			}
			return {
				signInSuccesful: authService.state.matches('signedIn'),
				nextStep: signInActorRef.state.matches('nextAuthChallenge'),
			};
		}
		return { signInSuccesful: false, nextStep: false };
	}

	async confirmSignIn(params: ConfirmSignInParams): Promise<SignInResult> {
		console.log('confirm signin');
		if (
			params.challengeName !== ChallengeNameType.SMS_MFA &&
			params.challengeName !== ChallengeNameType.SOFTWARE_TOKEN_MFA &&
			params.challengeName !== ChallengeNameType.NEW_PASSWORD_REQUIRED
		) {
			throw new Error('Not implemented');
		}
		const { actorRef } = this._authService.state.context;
		if (!actorRef || !this._authService.state.matches('signingIn')) {
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
		return this._authService.state.matches('signedIn');
	}

	async completeNewPassword(
		newPassword: string,
		requiredAttributes?: { [key: string]: any }
	): Promise<SignInResult> {
		if (!newPassword) {
			throw new Error('New password is required to do complete new password');
		}
		const { actorRef } = this._authService.state.context;
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

	private getSessionData(): {
		accessToken: string;
		idToken: string;
		refreshToken: string;
		expiration: number;
	} | null {
		if (typeof this._userStorage.getItem(COGNITO_CACHE_KEY) === 'string') {
			return JSON.parse(this._userStorage.getItem(COGNITO_CACHE_KEY) as string);
		}
		return null;
	}
	async fetchSession(): Promise<AmplifyUser> {
		// checks to see if the identity pool and region are already configured
		if (!this.isConfigured()) {
			throw new Error();
		}

		// if (this._authService.state.matches('signedIn')) {
		// 	return this._authService.state.context.session!;
		// }
		// return new Promise<AmplifyUser>((res, rej) => {
		// 	this._authService.onTransition(state => {
		// 		if (state.matches('signedIn')) {
		// 			console.log('creds? ', state.context.session);
		// 			res(state.context.session);
		// 		}
		// 	});
		// });

		// runs fetch session
		this._authzService.send(authzMachineEvents.signInRequested());

		// makes sure the config has both the region and an identity pool
		const { region, identityPoolId } = this._config;
		if (!region) {
			logger.debug('region is not configured for getting the credentials');
			throw new Error('region is not configured for getting the credentials');
		}
		if (!identityPoolId) {
			logger.debug('No Cognito Federated Identity pool provided');
			throw new Error('No Cognito Federated Identity pool provided');
		}
		const cognitoIdentityClient = this.createNewCognitoIdentityClient({
			region: this._config.region,
		});
		// gets tokens from userpool
		const session = this.getSessionData();

		// makes sure session is valid
		if (session === null) {
			// this._authzService.send(authzMachineEvents.noSession());
			throw new Error(
				'Does not have active user session, have you called .signIn?'
			);
		}

		// console.log('SESSION ID Token: ' + session.idToken);
		// console.log('SESSION ACCESS TOKEN: ' + session.accessToken);
		// console.log('SESSION REFRESH TOKEN: ' + session.refreshToken);

		const { idToken, accessToken, refreshToken } = session;
		this._authzService.send(
			authzMachineEvents.signInCompleted({ idToken, accessToken, refreshToken })
		);
		const expiration = getExpirationTimeFromJWT(idToken);
		console.log({ expiration });
		const cognitoIDPLoginKey = `cognito-idp.${this._config.region}.amazonaws.com/${this._config.userPoolId}`;
		const getIdRes = await cognitoIdentityClient.send(
			new GetIdCommand({
				IdentityPoolId: identityPoolId,
				Logins: {
					[cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		// console.log('IDENTITY ID: ' + getIdRes.IdentityId);
		// console.log(getIdRes.IdentityId);
		const getCredentialsRes = await cognitoIdentityClient.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: getIdRes.IdentityId,
				Logins: {
					[cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getCredentialsRes.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		// console.log('CREDENTIALS: ');
		// console.log(getCredentialsRes.Credentials);
		const cognitoClient = this.createNewCognitoClient({
			region: this._config.region,
		});
		const getUserRes = await cognitoClient.send(
			new GetUserCommand({
				AccessToken: accessToken,
			})
		);
		console.log({ getUserRes });
		const { sub } = decodeJWT(idToken);
		if (typeof sub !== 'string') {
			logger.error(
				'sub does not exist inside the JWT token or is not a string'
			);
		}

		// runs after fetchSession has successfully occurred
		this._authzService.send(authzMachineEvents.fetched());

		return {
			sessionId: '',
			user: {
				// sub
				userid: sub as string,
				// maybe username
				identifiers: [],
			},
			credentials: {
				default: {
					jwt: {
						idToken,
						accessToken,
						refreshToken,
					},
					aws: this.shearAWSCredentials(getCredentialsRes),
				},
			},
		};
	}
	private shearAWSCredentials(
		res: GetCredentialsForIdentityCommandOutput
	): AWSCredentials {
		if (!res.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		const { AccessKeyId, SecretKey, SessionToken, Expiration } =
			res.Credentials;
		return {
			accessKeyId: AccessKeyId,
			secretAccessKey: SecretKey,
			sessionToken: SessionToken,
			expiration: Expiration,
		};
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
		this._authzService.send(authzMachineEvents.signInRequested());
		this.clearCachedTokens();
		dispatchAuthEvent(
			'signOut',
			{ placeholder: 'placeholder' },
			'A user has been signed out'
		);
		return Promise.resolve();
	}

	private isConfigured(): boolean {
		return Boolean(this._config?.userPoolId) && Boolean(this._config?.region);
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
}
