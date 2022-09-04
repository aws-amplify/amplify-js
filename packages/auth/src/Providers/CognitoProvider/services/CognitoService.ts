import {
	CognitoIdentityProviderClient,
	CognitoIdentityProviderClientConfig,
	InitiateAuthCommandOutput,
	GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	CognitoIdentityClientConfig,
	CognitoIdentityClient,
	GetIdCommand,
	GetCredentialsForIdentityCommand,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import { AmplifyUser, AWSCredentials } from '../../../types';
import { getExpirationTimeFromJWT, decodeJWT } from '../Util';
import { StorageHelper, Logger } from '@aws-amplify/core';
import { CognitoUserPoolService } from './CognitoUserPoolService';
import { CognitoIdentityPoolService } from './CognitoIdentityPoolService';

const logger = new Logger('CognitoStatelessService');

const COGNITO_CACHE_KEY = '__cognito_cached_tokens';

interface CognitoServiceConfig {
	region: string;
	userPoolId: string;
	identityPoolId?: string;
	clientId: string;
}

/**
 * Provides an abstraction around aws-sdk interactions
 */
export class CognitoService {
	private readonly config: CognitoServiceConfig;
	private readonly clientConfig: CognitoIdentityProviderClientConfig;
	private cognitoIDPLoginKey: string;
	private cognitoIdentityPoolClient: CognitoIdentityClient;
	private cognitoUserPoolClient: CognitoIdentityProviderClient;

	constructor(
		config: CognitoServiceConfig,
		clientConfig: CognitoIdentityClientConfig = {}
	) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
			...clientConfig,
		};
		this.cognitoIDPLoginKey = `cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`;

		this.cognitoIdentityPoolClient = new CognitoIdentityPoolService(
			this.config,
			this.clientConfig,
			this.cognitoIDPLoginKey
		).client;

		this.cognitoUserPoolClient = new CognitoUserPoolService(
			this.config,
			this.clientConfig
		).client;
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
		const cognitoClient = this.cognitoUserPoolClient;
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
		const getIdRes = await this.cognitoIdentityPoolClient.send(
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
		const getCredentialsRes = await this.cognitoIdentityPoolClient.send(
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
}
