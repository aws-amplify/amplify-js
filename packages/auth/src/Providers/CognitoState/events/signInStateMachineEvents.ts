import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export type InitiateUserPasswordSignIn = {
	type: 'InitiateUserPasswordSignIn';
	payload: {
		config: {
			region: string;
			userPoolId: string;
			userPoolClientId: string;
		};
		client: CognitoIdentityProviderClient;
		username: string;
		password: string;
	};
};

export type ReceivedChallenge = {
	type: 'ReceivedChallenge';
	payload: {};
};

export type SignedIn = {
	type: 'SignedIn';
	payload: {};
};

export type ThrowError = {
	type: 'ThrowError';
	payload: {
		error: Error;
	};
};

export type SignInStateEvents =
	| InitiateUserPasswordSignIn
	| ReceivedChallenge
	| SignedIn
	| ThrowError;
