// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// From https://github.com/awslabs/aws-jwt-verify/blob/main/src/safe-json-parse.ts
// From https://github.com/awslabs/aws-jwt-verify/blob/main/src/jwt-model.ts

interface JwtPayloadStandardFields {
	exp?: number; // expires: https://tools.ietf.org/html/rfc7519#section-4.1.4
	iss?: string; // issuer: https://tools.ietf.org/html/rfc7519#section-4.1.1
	aud?: string | string[]; // audience: https://tools.ietf.org/html/rfc7519#section-4.1.3
	nbf?: number; // not before: https://tools.ietf.org/html/rfc7519#section-4.1.5
	iat?: number; // issued at: https://tools.ietf.org/html/rfc7519#section-4.1.6
	scope?: string; // scopes: https://tools.ietf.org/html/rfc6749#section-3.3
	jti?: string; // JWT ID: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
}

/** JSON type */
type Json = null | string | number | boolean | Json[] | JsonObject;

/** JSON Object type */
type JsonObject = { [name: string]: Json };

type JwtPayload = JwtPayloadStandardFields & JsonObject;

export type JWT = {
	payload: JwtPayload;
	toString: () => string;
};

export type JWTCreator = (stringJWT: string) => JWT;

export type AuthSession = {
	tokens?: AuthTokens;
	credentials?: AWSCredentials;
	identityId?: string;
	userSub?: string;
};

export type LibraryAuthOptions = {
	tokenProvider?: TokenProvider;
	credentialsProvider?: AWSCredentialsAndIdentityIdProvider;
};

export type Identity = {
	id: string;
	type: 'guest' | 'primary';
};

export interface AWSCredentialsAndIdentityIdProvider {
	getCredentialsAndIdentityId: (
		getCredentialsOptions: GetCredentialsOptions
	) => Promise<AWSCredentialsAndIdentityId>;
	clearCredentials: () => void;
}

export type TokenProvider = {
	getTokens: ({
		forceRefresh,
	}?: {
		forceRefresh?: boolean;
	}) => Promise<AuthTokens | null>;
};

export type FetchAuthSessionOptions = {
	forceRefresh?: boolean;
};

export type AuthTokens = {
	idToken?: JWT;
	accessToken: JWT;
};

export type AuthConfig = StrictUnion<
	| IdentityPoolConfig
	| UserPoolConfig
	| UserPoolConfigWithOAuth
	| UserPoolConfigAndIdentityPoolConfig
	| UserPoolConfigAndIdentityPoolConfigWithOAuth
>;

type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
	? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
	: never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

export type IdentityPoolConfig = {
	identityPoolId: string;
	userPoolWebClientId?: never;
	userPoolId?: never;
	clientMetadata?: never;
	isMandatorySignInEnabled?: never;
};

export type UserPoolConfig = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId?: never;
	clientMetadata?: Record<string, string>;
};

export type UserPoolConfigWithOAuth = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId?: never;
	clientMetadata?: Record<string, string>;
	oauth: OAuthConfig;
};

export type OAuthConfig = {
	domain: string;
	scopes: Array<string>;
	redirectSignIn: string;
	redirectSignOut: string;
	responseType: string;
};

export type UserPoolConfigAndIdentityPoolConfig = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId: string;
	clientMetadata?: Record<string, string>;
	isMandatorySignInEnabled?: boolean;
};

export type UserPoolConfigAndIdentityPoolConfigWithOAuth = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId: string;
	clientMetadata?: Record<string, string>;
	isMandatorySignInEnabled?: boolean;
	oauth: OAuthConfig;
};

export type GetCredentialsOptions =
	| GetCredentialsAuthenticatedUser
	| GetCredentialsUnauthenticatedUser;

type GetCredentialsAuthenticatedUser = {
	authenticated: true;
	forceRefresh?: boolean;
	authConfig: AuthConfig;
	tokens: AuthTokens;
};

type GetCredentialsUnauthenticatedUser = {
	authenticated: false;
	forceRefresh?: boolean;
	authConfig: AuthConfig;
	tokens?: never;
};

export type AWSCredentialsAndIdentityId = {
	credentials: AWSCredentials;
	identityId?: string;
};

type AWSCredentials = {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration?: Date;
};
