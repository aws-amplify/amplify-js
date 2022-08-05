import {
	CognitoIdentityProviderClient,
	SignUpCommandInput,
	SignUpCommand,
	ConfirmSignUpCommandInput,
	ConfirmSignUpCommand,
	CognitoIdentityProviderClientConfig,
	AuthFlowType,
	InitiateAuthCommandInput,
	InitiateAuthCommand,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommand,
	RespondToAuthChallengeCommandOutput,
	GetUserCommand,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClientConfig,
	CognitoIdentityClient,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import {
	SignInParams,
	SignUpResult,
	SignUpParams,
	ConfirmSignUpParams,
	SignInWithPassword,
	ConfirmSignInParams,
	AmplifyUser,
	AWSCredentials,
} from '../../types';
import { getExpirationTimeFromJWT, decodeJWT } from './Util';
import { StorageHelper, Logger } from '@aws-amplify/core';

const logger = new Logger('CognitoStatelessService');

const COGNITO_CACHE_KEY = '__cognito_cached_tokens';

type CognitoConfirmSignInOptions = ConfirmSignInParams & {
	session: string;
	username: string;
	clientId: string;
};

type CognitoCompletePasswordOptions = {
	username: string;
	newPassword: string;
	requiredAttributes?: { [key: string]: any };
	session: string;
};

type CognitoSessionData = {
	accessToken: string;
	idToken: string;
	refreshToken: string;
	expiration: number;
};

interface CognitoServiceConfig {
	region: string;
	userPoolId: string;
	identityPoolId?: string;
	clientId: string;
}

/**
 * This class serves as a layer between the CognitoProvider & the AWS SDK to make API calls to Cognito Userpool &
 * Identity Pool a little bit easier.
 * Client Configurations are done during the creation of the instance, so it doesn't need to be repeated on every
 * single API call.
 *
 * Note: We can potentially split this into AuthN and AuthZ for users who only wants to use either Cognito Userpool &
 * Cognito Identity Pool.
 */

export class CognitoService {
	private readonly config: CognitoServiceConfig;
	private readonly clientConfig: CognitoIdentityProviderClientConfig;
	private cognitoIdentityClient: CognitoIdentityClient;
	private cognitoIDPLoginKey: string;
	private cognitoClient: CognitoIdentityProviderClient;

	constructor(
		config: CognitoServiceConfig,
		clientConfig: CognitoIdentityClientConfig = {}
	) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
			...clientConfig,
		};
		this.cognitoIdentityClient = this.createCognitoIdentityClient();
		this.cognitoIDPLoginKey = `cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`;
		this.cognitoClient = this.createCognitoClient();
	}
	createCognitoClient() {
		return new CognitoIdentityProviderClient(this.clientConfig);
	}

	createCognitoIdentityClient() {
		return new CognitoIdentityClient(this.clientConfig);
	}

	getSessionData(userStorage = new StorageHelper().getStorage()): {
		accessToken: string;
		idToken: string;
		refreshToken: string;
		expiration: number;
	} | null {
		if (typeof userStorage.getItem(COGNITO_CACHE_KEY) === 'string') {
			return JSON.parse(userStorage.getItem(COGNITO_CACHE_KEY) as string);
		}
		return null;
	}

	shearAWSCredentials(
		res: GetCredentialsForIdentityCommandOutput
	): AWSCredentials {
		if (!res.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		const { AccessKeyId, SecretKey, SessionToken, Expiration } =
			res.Credentials;
		if (!AccessKeyId || !SecretKey) {
			throw new Error(
				'Access key or secret key is missing from the Credentials'
			);
		}
		if (!Expiration) {
			throw new Error('Expiration is missing from the Credentials');
		}
		return {
			accessKeyId: AccessKeyId,
			secretAccessKey: SecretKey,
			sessionToken: SessionToken,
			expiration: Expiration,
		};
	}

	async fetchSession(): Promise<AmplifyUser> {
		// TODO: add param for cognito client config
		const cognitoClient = this.cognitoClient;
		const session = this.getSessionData();
		if (session === null) {
			throw new Error(
				'Does not have active user session, have you called .signIn?'
			);
		}
		const { idToken, accessToken, refreshToken } = session;
		const expiration = getExpirationTimeFromJWT(idToken);
		console.log({ expiration });
		const cognitoIDPLoginKey = `cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`;
		const getIdRes = await this.cognitoIdentityClient.send(
			new GetIdCommand({
				IdentityPoolId: this.config.identityPoolId,
				Logins: {
					[cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		const getCredentialsRes = await this.cognitoIdentityClient.send(
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
			userInfo: {
				// sub
				userid: sub as string,
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

	async fetchUserPoolTokens() {
		const session = this.getSessionData();
		if (session === null) {
			throw new Error(
				'Does not have active user session, have you called .signIn?'
			);
		}
		const { idToken, accessToken, refreshToken } = session;
		const expiration = getExpirationTimeFromJWT(idToken);
		return {
			jwt: {
				idToken,
				accessToken,
				refreshToken,
			},
		};
	}

	async refreshUserPoolTokens(refreshToken: string) {
		const refreshTokenRes = await this.cognitoClient.send(
			new InitiateAuthCommand({
				AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
				AuthParameters: {
					REFRESH_TOKEN: refreshToken,
				},
				ClientId: this.config.clientId,
			})
		);

		// refreshTokenRes.AuthenticationResult <- the JWT tokens
		return refreshTokenRes;
	}

	async fetchIdentityId(idToken: string) {
		const getIdRes = await this.cognitoIdentityClient.send(
			new GetIdCommand({
				IdentityPoolId: this.config.identityPoolId,
				Logins: {
					[this.cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		return getIdRes.IdentityId;
	}

	async fetchUnAuthIdentityID() {
		const getIdRes = await this.cognitoIdentityClient.send(
			new GetIdCommand({
				IdentityPoolId: this.config.identityPoolId,
			})
		);
		if (!getIdRes.IdentityId) {
			throw new Error('Could not get Identity ID');
		}
		return getIdRes.IdentityId;
	}

	async fetchAWSCredentials(identityID: string, idToken: string) {
		const getCredentialsRes = await this.cognitoIdentityClient.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: identityID,
				Logins: {
					[this.cognitoIDPLoginKey]: idToken,
				},
			})
		);
		if (!getCredentialsRes.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		return getCredentialsRes.Credentials;
	}

	async fetchUnAuthAWSCredentials(identityID: string) {
		const getCredentialsRes = await this.cognitoIdentityClient.send(
			new GetCredentialsForIdentityCommand({
				IdentityId: identityID,
			})
		);
		if (!getCredentialsRes.Credentials) {
			throw new Error(
				'No credentials from the response of GetCredentialsForIdentity call.'
			);
		}
		return getCredentialsRes.Credentials;
	}

	async signIn(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignInParams & {
			password?: string;
			clientId: string;
			authFlow: AuthFlowType;
			storage?: Storage;
		}
	): Promise<InitiateAuthCommandOutput> {
		console.log('le cognito stateless signin');
		const { authFlow } = params;
		if (
			params.signInType === 'Link' ||
			params.signInType === 'Social' ||
			params.signInType === 'WebAuthn'
		) {
			throw new Error('Not implemented');
		}
		switch (authFlow) {
			case AuthFlowType.USER_PASSWORD_AUTH:
				return this.initiateAuthPlainUsernamePassword(clientConfig, params);
			default:
				throw new Error('Cagamos');
		}
	}

	cacheInitiateAuthResult(
		output: InitiateAuthCommandOutput,
		userStorage = new StorageHelper().getStorage()
	) {
		const { AuthenticationResult, Session } = output;
		if (!AuthenticationResult) {
			throw new Error(
				'Cannot cache session data - Initiate Auth did not return tokens'
			);
		}
		const {
			AccessToken,
			IdToken,
			RefreshToken,
			ExpiresIn = 0,
		} = AuthenticationResult;
		userStorage.setItem(
			COGNITO_CACHE_KEY,
			JSON.stringify({
				accessToken: AccessToken,
				idToken: IdToken,
				refreshToken: RefreshToken,
				// ExpiresIn is in seconds, but Date().getTime is in milliseconds
				expiration: new Date().getTime() + ExpiresIn * 1000,
				...(Session && { session: Session }),
			})
		);
	}

	async initiateAuthPlainUsernamePassword(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignInWithPassword & { authFlow: AuthFlowType; clientId: string }
	): Promise<InitiateAuthCommandOutput> {
		const { username, password, authFlow, clientId, clientMetadata } = params;
		if (!password) throw new Error('No password');
		const initiateAuthInput: InitiateAuthCommandInput = {
			AuthFlow: authFlow,
			ClientId: clientId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
			ClientMetadata: clientMetadata,
		};
		const client = this.createCognitoClient();
		const res = await client.send(new InitiateAuthCommand(initiateAuthInput));
		return res;
	}

	async cognitoConfirmSignUp(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: ConfirmSignUpParams & { clientId: string }
	): Promise<SignUpResult> {
		const client = this.createCognitoClient();
		const { clientId, username, confirmationCode } = params;
		const input: ConfirmSignUpCommandInput = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: confirmationCode,
		};
		const res = await client.send(new ConfirmSignUpCommand(input));
		return res;
	}

	async cognitoConfirmSignIn(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: CognitoConfirmSignInOptions
	): Promise<RespondToAuthChallengeCommandOutput> {
		const {
			confirmationCode = '',
			mfaType = 'SMS_MFA',
			username,
			session,
			clientId,
		} = params;
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		challengeResponses.USERNAME = username;
		challengeResponses[
			mfaType === 'SMS_MFA' ? 'SMS_MFA_CODE' : 'SOFTWARE_TOKEN_MFA'
		] = confirmationCode;
		const client = this.createCognitoClient();
		const res = await client.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: mfaType,
				ChallengeResponses: challengeResponses,
				ClientId: clientId,
				Session: session,
			})
		);
		return res;
	}

	async cognitoSignUp(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignUpParams & { clientId: string }
	): Promise<SignUpResult> {
		const client = this.createCognitoClient();
		const { username, password, clientId, attributes } = params;
		const input: SignUpCommandInput = {
			Username: username,
			Password: password,
			ClientId: clientId,
			...(attributes && {
				UserAttributes: Object.entries(attributes).map(([k, v]) => ({
					Name: k,
					Value: v,
				})),
			}),
		};
		try {
			const res = await client.send(new SignUpCommand(input));
			console.log(res);
			return res;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	async completeNewPassword({
		username,
		newPassword,
		session,
		requiredAttributes,
	}: CognitoCompletePasswordOptions) {
		const client = this.createCognitoClient();
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		challengeResponses.NEW_PASSWORD = newPassword;
		challengeResponses.USERNAME = username;
		if (requiredAttributes) {
			for (const [k, v] of Object.entries(requiredAttributes)) {
				challengeResponses[`userAttributes.${k}`] = v;
			}
		}
		const res = await client.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
				ClientId: this.config.clientId,
				ChallengeResponses: challengeResponses,
				Session: session,
			})
		);
		return res;
	}
}
