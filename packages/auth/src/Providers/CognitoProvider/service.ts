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

type FetchSessionOptions = CognitoIdentityClientConfig & {
	identityPoolId: string;
	sessionData: CognitoSessionData;
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
}

export class CognitoService {
	private readonly config: CognitoServiceConfig;
	constructor(config: CognitoServiceConfig) {
		this.config = config;
	}
	createCognitoClient(config: CognitoIdentityProviderClientConfig) {
		return new CognitoIdentityProviderClient(config);
	}

	createCognitoIdentityClient(config: CognitoIdentityClientConfig) {
		return new CognitoIdentityClient(config);
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
		return {
			// @ts-ignore
			accessKeyId: AccessKeyId,
			// @ts-ignore
			secretAccessKey: SecretKey,
			// @ts-ignore
			sessionToken: SessionToken,
			// @ts-ignore
			expiration: Expiration,
		};
	}

	async cognitoFetchSession(
		clientConfig: CognitoIdentityClientConfig,
		params: { identityPoolId: string; userPoolId: string }
	): Promise<AmplifyUser> {
		const cognitoIdentityClient = createCognitoIdentityClient(clientConfig);
		// TODO: add param for cognito client config
		const cognitoClient = createCognitoClient({ region: clientConfig.region });
		const session = getSessionData();
		if (session === null) {
			throw new Error(
				'Does not have active user session, have you called .signIn?'
			);
		}
		const { idToken, accessToken, refreshToken } = session;
		const expiration = getExpirationTimeFromJWT(idToken);
		console.log({ expiration });
		const cognitoIDPLoginKey = `cognito-idp.${clientConfig.region}.amazonaws.com/${params.userPoolId}`;
		const getIdRes = await cognitoIdentityClient.send(
			new GetIdCommand({
				IdentityPoolId: params.identityPoolId,
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
		console.log({ getUserRes });
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
					aws: shearAWSCredentials(getCredentialsRes),
				},
			},
		};
	}

	async cognitoSignIn(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: SignInParams & {
			password?: string;
			clientId: string;
			authFlow: AuthFlowType;
			storage?: Storage;
		}
	): Promise<InitiateAuthCommandOutput> {
		console.log('cognito stateless signin');
		const { authFlow, storage = new StorageHelper().getStorage() } = params;
		if (
			params.signInType === 'Link' ||
			params.signInType === 'Social' ||
			params.signInType === 'WebAuthn'
		) {
			throw new Error('Not implemented');
		}
		switch (authFlow) {
			case AuthFlowType.USER_PASSWORD_AUTH:
				return initiateAuthPlainUsernamePassword(clientConfig, params);
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
		const client = createCognitoClient(clientConfig);
		const res = await client.send(new InitiateAuthCommand(initiateAuthInput));
		return res;
	}

	async cognitoConfirmSignUp(
		clientConfig: CognitoIdentityProviderClientConfig,
		params: ConfirmSignUpParams & { clientId: string }
	): Promise<SignUpResult> {
		const client = createCognitoClient(clientConfig);
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
			confirmationCode,
			mfaType = 'SMS_MFA',
			username,
			session,
			clientId,
		} = params;
		const challengeResponses: RespondToAuthChallengeCommandInput['ChallengeResponses'] =
			{};
		challengeResponses.USERNAME = username;
		// @ts-ignore
		challengeResponses[
			mfaType === 'SMS_MFA' ? 'SMS_MFA_CODE' : 'SOFTWARE_TOKEN_MFA'
		] = confirmationCode;
		const client = createCognitoClient(clientConfig);
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
		const client = createCognitoClient(clientConfig);
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
}

export function createCognitoClient(
	config: CognitoIdentityProviderClientConfig
) {
	return new CognitoIdentityProviderClient(config);
}

export function createCognitoIdentityClient(
	config: CognitoIdentityClientConfig
) {
	return new CognitoIdentityClient(config);
}

function getSessionData(userStorage = new StorageHelper().getStorage()): {
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
function shearAWSCredentials(
	res: GetCredentialsForIdentityCommandOutput
): AWSCredentials {
	if (!res.Credentials) {
		throw new Error(
			'No credentials from the response of GetCredentialsForIdentity call.'
		);
	}
	const { AccessKeyId, SecretKey, SessionToken, Expiration } = res.Credentials;
	return {
		// @ts-ignore
		accessKeyId: AccessKeyId,
		// @ts-ignore
		secretAccessKey: SecretKey,
		// @ts-ignore
		sessionToken: SessionToken,
		// @ts-ignore
		expiration: Expiration,
	};
}

export async function cognitoFetchSession(
	clientConfig: CognitoIdentityClientConfig,
	params: { identityPoolId: string; userPoolId: string }
): Promise<AmplifyUser> {
	const cognitoIdentityClient = createCognitoIdentityClient(clientConfig);
	// TODO: add param for cognito client config
	const cognitoClient = createCognitoClient({ region: clientConfig.region });
	const session = getSessionData();
	if (session === null) {
		throw new Error(
			'Does not have active user session, have you called .signIn?'
		);
	}
	const { idToken, accessToken, refreshToken } = session;
	const expiration = getExpirationTimeFromJWT(idToken);
	console.log({ expiration });
	const cognitoIDPLoginKey = `cognito-idp.${clientConfig.region}.amazonaws.com/${params.userPoolId}`;
	const getIdRes = await cognitoIdentityClient.send(
		new GetIdCommand({
			IdentityPoolId: params.identityPoolId,
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
	console.log({ getUserRes });
	const { sub } = decodeJWT(idToken);
	if (typeof sub !== 'string') {
		logger.error('sub does not exist inside the JWT token or is not a string');
	}
	return {
		sessionId: '',
		userInfo: {
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
				aws: shearAWSCredentials(getCredentialsRes),
			},
		},
	};
}

export async function cognitoSignIn(
	clientConfig: CognitoIdentityProviderClientConfig,
	params: SignInParams & {
		password?: string;
		clientId: string;
		authFlow: AuthFlowType;
		storage?: Storage;
	}
): Promise<InitiateAuthCommandOutput> {
	console.log('cognito stateless signin');
	const { authFlow, storage = new StorageHelper().getStorage() } = params;
	if (
		params.signInType === 'Link' ||
		params.signInType === 'Social' ||
		params.signInType === 'WebAuthn'
	) {
		throw new Error('Not implemented');
	}
	switch (authFlow) {
		case AuthFlowType.USER_PASSWORD_AUTH:
			return initiateAuthPlainUsernamePassword(clientConfig, params);
		default:
			throw new Error('Cagamos');
	}
}

export function cacheInitiateAuthResult(
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
		})
	);
}

async function initiateAuthPlainUsernamePassword(
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
	const client = createCognitoClient(clientConfig);
	const res = await client.send(new InitiateAuthCommand(initiateAuthInput));
	return res;
}

export async function cognitoConfirmSignUp(
	clientConfig: CognitoIdentityProviderClientConfig,
	params: ConfirmSignUpParams & { clientId: string }
): Promise<SignUpResult> {
	const client = createCognitoClient(clientConfig);
	const { clientId, username, confirmationCode } = params;
	const input: ConfirmSignUpCommandInput = {
		ClientId: clientId,
		Username: username,
		ConfirmationCode: confirmationCode,
	};
	const res = await client.send(new ConfirmSignUpCommand(input));
	return res;
}

export async function cognitoConfirmSignIn(
	clientConfig: CognitoIdentityProviderClientConfig,
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
	// @ts-ignore
	challengeResponses[
		mfaType === 'SMS_MFA' ? 'SMS_MFA_CODE' : 'SOFTWARE_TOKEN_MFA'
	] = confirmationCode;
	const client = createCognitoClient(clientConfig);
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

export async function cognitoSignUp(
	clientConfig: CognitoIdentityProviderClientConfig,
	params: SignUpParams & { clientId: string }
): Promise<SignUpResult> {
	const client = createCognitoClient(clientConfig);
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
