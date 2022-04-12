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
	SignInWithPassword,
} from '../../types';
import {
	CognitoIdentityProviderClient,
	InitiateAuthCommandInput,
	InitiateAuthCommand,
	InitiateAuthCommandOutput,
	GetUserCommand,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClient,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import { dispatchAuthEvent, decodeJWT } from './Util';
import { Logger, StorageHelper } from '@aws-amplify/core';

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

export type CognitoProviderConfig = {
	userPoolId: string;
	clientId: string;
	region: string;
	storage?: Storage;
	identityPoolId?: string;
	clientMetadata?: { [key: string]: string };
};

export enum AuthFlow {
	USER_SRP_AUTH = 'USER_SRP_AUTH',
	REFRESH_TOKEN_AUTH = 'REFRESH_TOKEN_AUTH',
	REFRESH_TOKEN = 'REFRESH_TOKEN',
	CUSTOM_AUTH = 'CUSTOM_AUTH',
	USER_PASSWORD_AUTH = 'USER_PASSWORD_AUTH',
}

export class CognitoProvider implements AuthProvider {
	static readonly CATEGORY = 'Auth';
	static readonly PROVIDER_NAME = 'CognitoProvider';
	private _config: CognitoProviderConfig;
	private _userStorage: Storage;
	private _storageSync: Promise<void> = Promise.resolve();
	// For the purpose of prototyping / testing it we are using plain username password flow for now
	private _authFlow = AuthFlow.USER_PASSWORD_AUTH;
	private _session: string | null = null;
	private _username: string | null = null;

	constructor(config: PluginConfig) {
		this._config = config ?? {};
		this._userStorage = config.storage ?? new StorageHelper().getStorage();
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
		};
		if (config.storage) {
			this._userStorage = config.storage;
		}
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
	private isAuthenticated() {
		// TODO: should also check if token has expired?
		const session = this.getSessionData();
		return session !== null;
	}
	async signIn(
		params: SignInParams & { password?: string }
	): Promise<SignInResult> {
		if (!this.isConfigured()) {
			throw new Error('Plugin not configured');
		}
		if (
			params.signInType === 'Link' ||
			params.signInType === 'Social' ||
			params.signInType === 'WebAuthn'
		) {
			throw new Error('Not implemented');
		}
		// throw error if user is already signed in
		if (this.isAuthenticated()) {
			throw new Error(
				'User is already authenticated, please sign out the current user before signing in.'
			);
		}
		// Plain username password flow
		if (this._authFlow === AuthFlow.USER_PASSWORD_AUTH) {
			const { username, password } = params;
			if (!password) {
				throw new Error('Password is required for USER_PASSWORD_AUTH flow');
			}
			const res = await this.initiateAuthPlainUsernamePassword(
				params as SignInWithPassword & { password: string }
			);
			if (this.hasChallenge(res)) {
				this._session = res.Session;
				this._username = username;
				return { signInSuccesful: false, nextStep: true };
			} else {
				this.cacheSessionData(res);
				this._username = username;
				// placeholder signin event
				dispatchAuthEvent(
					'signIn',
					{ something: 'something' },
					'a user has been signed in.'
				);
				return Promise.resolve({ signInSuccesful: true, nextStep: false });
			}
		}
		throw new Error('Cagamos');
	}

	private sendMFACode(
		confirmationCode: string,
		mfaType: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA',
		clientMetaData: { [key: string]: string }
	) {
		const challengeResponses = {};
	}

	private hasChallenge(
		res: InitiateAuthCommandOutput
	): res is InitiateAuthCommandOutput & {
		ChallengeName: string;
		ChallengeParameters: { [key: string]: string };
		Session: string;
	} {
		return (
			typeof res.ChallengeName === 'string' &&
			typeof res.ChallengeParameters === 'object' &&
			typeof res.Session === 'string'
		);
	}

	private async initiateAuthPlainUsernamePassword(
		params: SignInParams & {
			password: string;
			clientMetadata?: { [key: string]: string };
		}
	): Promise<InitiateAuthCommandOutput> {
		if (
			params.signInType === 'Link' ||
			params.signInType === 'Social' ||
			params.signInType === 'WebAuthn'
		) {
			throw new Error('Not implemented');
		}
		const { username, password } = params;
		const client = this.createNewCognitoClient({
			region: this._config?.region,
		});
		const initiateAuthInput: InitiateAuthCommandInput = {
			AuthFlow: this._authFlow,
			ClientId: this._config?.clientId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
			ClientMetadata: params.clientMetadata || this._config?.clientMetadata,
		};
		try {
			const res = await client.send(new InitiateAuthCommand(initiateAuthInput));
			return res;
		} catch (err) {
			logger.error(err);
			throw err;
		}
	}

	private handleChallenge(challengeName: CognitoChallenge) {
		switch (challengeName) {
			case 'SMS_MFA':
				throw new Error('not implemented');
			case 'MFA_SETUP':
				throw new Error('not implemented');
			case 'CUSTOM_CHALLENGE':
				throw new Error('not implemented');
			case 'DEVICE_SRP_AUTH':
				throw new Error('not implemented');
			case 'NEW_PASSWORD_REQUIRED':
				return this.handleNewPasswordRequiredChallenge();
				throw new Error('not implemented');
			case 'SOFTWARE_TOKEN_MFA':
				throw new Error('not implemented');
			case 'SELECT_MFA_TYPE':
				throw new Error('not implemented');
			default:
				throw new Error(`${challengeName} is not a valid challenge`);
		}
	}

	private handleNewPasswordRequiredChallenge() {
		console.log('handle new password required challenge');
	}

	private cacheSessionData(output: InitiateAuthCommandOutput) {
		const { AuthenticationResult, Session } = output;
		if (!AuthenticationResult) {
			throw new Error(
				'Cannot cache session data - Initiate Auth did not return tokens'
			);
		}
		const { AccessToken, IdToken, RefreshToken } = AuthenticationResult;
		this._userStorage.setItem(
			COGNITO_CACHE_KEY,
			JSON.stringify({
				accessToken: AccessToken,
				idToken: IdToken,
				refreshToken: RefreshToken,
				...(Session && { session: Session }),
			})
		);
	}

	private handleSmsMfaChallenge(
		params: ConfirmSignInParams & { mfaType: 'SMS_MFA' }
	) {
		const { confirmationCode, mfaType = 'SMS_MFA' } = params;
	}

	private respondToChallenge(challengeName: CognitoChallenge) {
		if (!this._username) {
			throw new Error(
				`No stored username to handle this challenge, please signIn.`
			);
		}
		if (!this._session) {
			throw new Error(
				`No stored Session to handle the ${challengeName} challenge`
			);
		}
	}

	async confirmSignIn(params: ConfirmSignInParams): Promise<SignInResult> {
		const { confirmationCode, mfaType = 'SMS_MFA' } = params;
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		if (!this._username) {
			throw new Error(
				'No stored username, please sign in before using confirmSignIn'
			);
		}
		if (!this._session) {
			throw new Error('No stored Session to handle the login challenge');
		}
		challengeResponses.USERNAME = this._username;
		challengeResponses[
			mfaType === 'SMS_MFA' ? 'SMS_MFA_CODE' : 'SOFTWARE_TOKEN_MFA'
		] = confirmationCode;
		const respondToAuthChallengeInput: RespondToAuthChallengeCommandInput = {
			ChallengeName: mfaType,
			ChallengeResponses: challengeResponses,
			ClientId: this._config.clientId,
			Session: this._session,
		};
		const cognitoClient = this.createNewCognitoClient({
			region: this._config.region,
		});
		const res = await cognitoClient.send(
			new RespondToAuthChallengeCommand(respondToAuthChallengeInput)
		);
		return this.finishSignInFlow(res);
	}

	async completeNewPassword(
		newPassword: string,
		requiredAttributes?: { [key: string]: any }
	): Promise<SignInResult> {
		if (!newPassword) {
			throw new Error('Need password');
		}
		if (!this._username) {
			throw new Error(
				'No stored username, please sign in before using completeNewPassword'
			);
		}
		if (!this._session) {
			throw new Error('No stored Session to handle the login challenge');
		}
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		const prefix = 'userAttributes.';
		challengeResponses.NEW_PASSWORD = newPassword;
		challengeResponses.USERNAME = this._username;
		if (requiredAttributes) {
			for (const [k, v] of Object.entries(requiredAttributes)) {
				challengeResponses[prefix + k] = v;
			}
		}
		const respondToAuthChallengeInput: RespondToAuthChallengeCommandInput = {
			ChallengeName: 'NEW_PASSWORD_REQUIRED',
			ClientId: this._config.clientId,
			ChallengeResponses: challengeResponses,
			Session: this._session,
		};
		const cognitoClient = this.createNewCognitoClient({
			region: this._config.region,
		});
		const res = await cognitoClient.send(
			new RespondToAuthChallengeCommand(respondToAuthChallengeInput)
		);
		return this.finishSignInFlow(res);
	}

	private finishSignInFlow(res: InitiateAuthCommandOutput) {
		if (this.hasChallenge(res)) {
			this._session = res.Session;
			return { signInSuccesful: false, nextStep: true };
		} else {
			this.cacheSessionData(res);
			// placeholder signin event
			dispatchAuthEvent(
				'signIn',
				{ something: 'something' },
				'a user has been signed in.'
			);
			return { signInSuccesful: true, nextStep: false };
		}
	}

	private getSessionData(): {
		accessToken: string;
		idToken: string;
		refreshToken: string;
	} | null {
		if (typeof this._userStorage.getItem(COGNITO_CACHE_KEY) === 'string') {
			return JSON.parse(this._userStorage.getItem(COGNITO_CACHE_KEY) as string);
		}
		return null;
	}
	async fetchSession(): Promise<AmplifyUser> {
		if (!this.isConfigured()) {
			throw new Error();
		}
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
		const session = this.getSessionData();
		if (session === null) {
			throw new Error(
				'Does not have active user session, have you called .signIn?'
			);
		}
		const { idToken, accessToken, refreshToken } = session;
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
		const getCredentialsRes = await cognitoIdentityClient.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: getIdRes.IdentityId,
				Logins: {
					[cognitoIDPLoginKey]: idToken,
				},
			})
		);
		const cognitoClient = this.createNewCognitoClient({
			region: this._config.region,
		});
		const getUserRes = await cognitoClient.send(
			new GetUserCommand({
				AccessToken: accessToken,
			})
		);
		const { sub } = decodeJWT(idToken);
		if (typeof sub !== 'string') {
			logger.error(
				'sub does not exist inside the JWT token or is not a string'
			);
		}
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

	private clearCachedTokens() {
		this._userStorage.removeItem(COGNITO_CACHE_KEY);
	}

	private createNewCognitoClient(config: {
		region?: string;
	}): CognitoIdentityProviderClient {
		const cognitoIdentityProviderClient = new CognitoIdentityProviderClient(
			config
		);
		return cognitoIdentityProviderClient;
	}

	private createNewCognitoIdentityClient(config: {
		region?: string;
	}): CognitoIdentityClient {
		const cognitoIdentityClient = new CognitoIdentityClient(config);
		return cognitoIdentityClient;
	}
}
