import { ConfirmSignUpParams } from './model/signup/ConfirmSignUpParams';
import { ConfirmSignUpResult } from './model/signup/ConfirmSignUpResult';
import { SignUpResult } from './model/signup/SignUpResult';

export enum USER_PARAM_TYPE {
	EMAIL = 'email',
	PHONE = 'phone',
}

export enum SOCIAL_PROVIDER {
	FACEBOOK = 'Facebook',
	GOOGLE = 'Google',
}

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

type PluginConfig = any | { Auth: any };

export type AuthZOptions = {
	category: 'Storage' | 'API' | 'Analytics' | 'Interactions' | 'Predictions';
	provider: string;
	resourceId: {
		[key: string]: string;
	};
};

export type AuthorizationToken = {
	token: string;
};

export type ApiKey = {
	apiKey: string;
};

export type AuthorizationResponse = AuthorizationToken | ApiKey;

export function isAuthorizationToken(
	authResponse: AuthorizationResponse
): authResponse is AuthorizationToken {
	return authResponse && !!Object.keys(authResponse).find(k => k === 'token');
}

export function isApiKey(
	authResponse: AuthorizationResponse
): authResponse is ApiKey {
	return authResponse && !!Object.keys(authResponse).find(k => k === 'apiKey');
}

export {
	SignInParams,
	ConfirmSignUpParams,
	SignUpResult,
	ConfirmSignUpResult,
	PluginConfig,
	AddAuthenticatorResponse,
	RequestScopeResponse,
};
