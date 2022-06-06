import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';

export enum USER_PARAM_TYPE {
	EMAIL = 'email',
	PHONE = 'phone',
}

export enum SOCIAL_PROVIDER {
	FACEBOOK = 'Facebook',
	GOOGLE = 'Google',
}

type SignInResult = {
	signInSuccesful: boolean;
	nextStep: boolean;
};

type AddAuthenticatorResponse = {
	addAuthenticatorSuccessful: boolean;
};

type RequestScopeResponse = {
	requestScopeSuccessful: boolean;
};

export type SignInMethod =
	| SignInWithLink['signInType']
	| SignInWithWebAuthn['signInType']
	| SignInWithSocial['signInType']
	| SignInWithPassword['signInType'];

export type SignInWithPassword = {
	signInType: 'Password';
	username: string;
	password?: string;
	clientMetadata?: { [key: string]: string };
};

export type SignInWithLink = {
	signInType: 'Link';
	link: {
		method: USER_PARAM_TYPE;
		value: string;
	};
};

export type SignInWithWebAuthn = {
	signInType: 'WebAuthn';
	webauthn: {
		method: USER_PARAM_TYPE;
		value: string;
	};
};

export type SignInWithSocial = {
	signInType: 'Social';
	social?: {
		provider: SOCIAL_PROVIDER;
	};
};

type SignInParams =
	| SignInWithLink
	| SignInWithWebAuthn
	| SignInWithSocial
	| SignInWithPassword;

export function isSignInWithWebAuthN(
	signInParams: SignInParams
): signInParams is SignInWithWebAuthn {
	return (
		signInParams && !!Object.keys(signInParams).find(k => k === 'webauthn')
	);
}

export function isSignInWithLink(
	signInParams: any
): signInParams is SignInWithLink {
	return signInParams && !!Object.keys(signInParams).find(k => k === 'link');
}

export function isSignInWithSocial(
	signInParams: any
): signInParams is SignInWithSocial {
	return signInParams && !!Object.keys(signInParams).find(k => k === 'social');
}

type ConfirmSignUpParams = {
	confirmationCode: string;
	username: string;
};

type SignUpResult = {};

type ConfirmSignInParams = {
	confirmationCode?: string;
	newPassword?: string;
	challengeName:
		| ChallengeNameType.SMS_MFA
		| ChallengeNameType.SOFTWARE_TOKEN_MFA
		| ChallengeNameType.NEW_PASSWORD_REQUIRED;
	// challengeName: ChallengeNameType;
	// default to SMS_MFA
	mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';
	clientMetadata?: { [key: string]: string };
};

type UserIdentifiers = {
	type: string;
	value: string;
};

type AmplifyUser = {
	sessionId: string;
	user?: {
		userid: string;
		identifiers?: UserIdentifiers[];
	};
	credentials?: {
		// scope
		[key: string]: {
			jwt?: {
				idToken: string;
				accessToken: string;
				refreshToken: string;
			};
			aws?: AWSCredentials;
		};
	};
};

type PluginConfig = any | { Auth: any };

export type SignUpParams = {
	username: string;
	password: string;
	attributes?: object;
	validationData?: { [key: string]: any };
	clientMetadata?: { [key: string]: string };
};

export type AuthZOptions = {
	category: 'Storage' | 'API' | 'Analytics' | 'Interactions' | 'Predictions';
	provider: string;
	resourceId: {
		[key: string]: string;
	};
};

export type AWSCredentials = {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken: string;
	expiration: Date;
};

export type AuthorizationToken = {
	token: string;
};

export type ApiKey = {
	apiKey: string;
};

export type AuthorizationResponse =
	| AuthorizationToken
	| AWSCredentials
	| ApiKey;

export function isAuthorizationToken(
	authResponse: AuthorizationResponse
): authResponse is AuthorizationToken {
	return authResponse && !!Object.keys(authResponse).find(k => k === 'token');
}

export function isAWSCredentials(
	authResponse: AuthorizationResponse
): authResponse is AWSCredentials {
	return (
		authResponse &&
		!!Object.keys(authResponse).find(k => k === 'accessKeyId') &&
		!!Object.keys(authResponse).find(k => k === 'secretAccessKey') &&
		!!Object.keys(authResponse).find(k => k === 'sessionToken') &&
		!!Object.keys(authResponse).find(k => k === 'expiration')
	);
}

export function isApiKey(
	authResponse: AuthorizationResponse
): authResponse is ApiKey {
	return authResponse && !!Object.keys(authResponse).find(k => k === 'apiKey');
}

export {
	SignInResult,
	SignInParams,
	ConfirmSignUpParams,
	SignUpResult,
	ConfirmSignInParams,
	AmplifyUser,
	PluginConfig,
	AddAuthenticatorResponse,
	RequestScopeResponse,
};
