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
	ConfirmSignUpResult,
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
	private readonly cognitoUserpoolClient: CognitoIdentityProviderClient;
	private readonly cognitoIdentityPoolClient: CognitoIdentityClient;

	constructor(
		config: CognitoServiceConfig,
		clientConfig: CognitoIdentityClientConfig = {}
	) {
		this.config = config;
		this.clientConfig = {
			region: this.config.region,
			...clientConfig,
		};
		this.cognitoUserpoolClient = new CognitoIdentityProviderClient(
			this.clientConfig
		);
		this.cognitoIdentityPoolClient = new CognitoIdentityClient(
			this.clientConfig
		);
	}
	createCognitoClient() {
		return new CognitoIdentityProviderClient(this.clientConfig);
	}

	createCognitoIdentityClient() {
		return new CognitoIdentityClient(this.clientConfig);
	}

	getSessionData(
		userStorage = new StorageHelper().getStorage()
	): CognitoSessionData | null {
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
		return {
			accessKeyId: AccessKeyId,
			secretAccessKey: SecretKey,
			sessionToken: SessionToken,
			expiration: Expiration,
		};
	}

	async fetchSession(): Promise<AmplifyUser> {
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
		const getUserRes = await this.cognitoUserpoolClient.send(
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

	async signIn(
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
				return this.initiateAuthPlainUsernamePassword(params);
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
		const res = await this.cognitoUserpoolClient.send(
			new InitiateAuthCommand(initiateAuthInput)
		);
		return res;
	}

	async confirmSignUp(
		params: ConfirmSignUpParams & { clientId: string }
	): Promise<ConfirmSignUpResult> {
		const { clientId, username, confirmationCode } = params;
		const input: ConfirmSignUpCommandInput = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: confirmationCode,
		};
		const res = await this.cognitoUserpoolClient.send(
			new ConfirmSignUpCommand(input)
		);
		return res;
	}

	async confirmSignIn(
		params: CognitoConfirmSignInOptions
	): Promise<RespondToAuthChallengeCommandOutput> {
		const {
			confirmationCode,
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
		const res = await this.cognitoUserpoolClient.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: mfaType,
				ChallengeResponses: challengeResponses,
				ClientId: clientId,
				Session: session,
			})
		);
		return res;
	}

	async signUp(
		params: SignUpParams & { clientId: string }
	): Promise<SignUpResult> {
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
			const res = await this.cognitoUserpoolClient.send(
				new SignUpCommand(input)
			);
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
