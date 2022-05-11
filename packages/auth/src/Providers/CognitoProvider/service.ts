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
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClientConfig } from '@aws-sdk/client-cognito-identity';
import {
	SignInParams,
	SignUpResult,
	SignUpParams,
	ConfirmSignUpParams,
	SignInWithPassword,
	ConfirmSignInParams,
} from '../../types';

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

function curry(fn: (...a: any[]) => any) {
	return function curried(...args1: any[]) {
		if (arguments.length >= fn.length) {
			return fn(arguments);
		} else {
			// @ts-ignore
			return (...args2: any[]) => curried.apply(this, [...args1, ...args2]);
		}
	};
}

export function createCognitoClient(
	config: CognitoIdentityProviderClientConfig
) {
	return new CognitoIdentityProviderClient(config);
}

export async function cognitoSignIn(
	clientConfig: CognitoIdentityProviderClientConfig,
	params: SignInParams & {
		password?: string;
		clientId: string;
		authFlow: AuthFlowType;
	}
): Promise<InitiateAuthCommandOutput> {
	console.log('cognito stateless signin');
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
			return initiateAuthPlainUsernamePassword(clientConfig, params);
		default:
			throw new Error('Cagamos');
	}
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

export async function fetchSession(params: FetchSessionOptions) {
	const {} = params;
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
