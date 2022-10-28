// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface FederatedUser {
	name: string;
	email?: string;
	picture?: string;
}

export interface AwsCognitoOAuthOpts {
	domain: string;
	scope: Array<string>;
	redirectSignIn: string;
	redirectSignOut: string;
	responseType: string;
	options?: object;
	urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
}

export function isCognitoHostedOpts(
	oauth: OAuthOpts
): oauth is AwsCognitoOAuthOpts {
	return (<AwsCognitoOAuthOpts>oauth).redirectSignIn !== undefined;
}

export interface Auth0OAuthOpts {
	domain: string;
	clientID: string;
	scope: string;
	redirectUri: string;
	audience: string;
	responseType: string;
	returnTo: string;
	urlOpener?: (url: string, redirectUrl: string) => Promise<any>;
}

// Replacing to fix typings
// export interface OAuth {
//     awsCognito?: awsCognitoOAuthOpts,
//     auth0?: any
// }

export type OAuthOpts = AwsCognitoOAuthOpts | Auth0OAuthOpts;

export interface ConfirmSignUpOptions {
	forceAliasCreation?: boolean;
	clientMetadata?: ClientMetaData;
}

export interface SignOutOpts {
	global?: boolean;
}

export interface CurrentUserOpts {
	bypassCache: boolean;
}

export interface GetPreferredMFAOpts {
	bypassCache: boolean;
}

export type UsernamePasswordOpts = {
	username: string;
	password: string;
	validationData?: { [key: string]: any };
};

export enum AuthErrorTypes {
	NoConfig = 'noConfig',
	MissingAuthConfig = 'missingAuthConfig',
	EmptyUsername = 'emptyUsername',
	InvalidUsername = 'invalidUsername',
	EmptyPassword = 'emptyPassword',
	EmptyCode = 'emptyCode',
	SignUpError = 'signUpError',
	NoMFA = 'noMFA',
	InvalidMFA = 'invalidMFA',
	EmptyChallengeResponse = 'emptyChallengeResponse',
	NoUserSession = 'noUserSession',
	Default = 'default',
	DeviceConfig = 'deviceConfig',
	NetworkError = 'networkError',
	AutoSignInError = 'autoSignInError',
}

export type AuthErrorMessages = { [key in AuthErrorTypes]: AuthErrorMessage };

export interface AuthErrorMessage {
	message: string;
	log?: string;
}

// We can extend this in the future if needed
export type SignInOpts = UsernamePasswordOpts;

export type ClientMetaData =
	| {
			[key: string]: string;
	  }
	| undefined;

export function isUsernamePasswordOpts(obj: any): obj is UsernamePasswordOpts {
	return !!(obj as UsernamePasswordOpts).username;
}

export interface IAuthDevice {
	id: string;
	name: string;
}

export interface AutoSignInOptions {
	enabled: boolean;
	clientMetaData?: ClientMetaData;
	validationData?: { [key: string]: any };
}

export enum GRAPHQL_AUTH_MODE {
	API_KEY = 'API_KEY',
	AWS_IAM = 'AWS_IAM',
	OPENID_CONNECT = 'OPENID_CONNECT',
	AMAZON_COGNITO_USER_POOLS = 'AMAZON_COGNITO_USER_POOLS',
	AWS_LAMBDA = 'AWS_LAMBDA',
}
