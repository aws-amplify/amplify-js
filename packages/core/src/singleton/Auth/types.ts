// From https://github.com/awslabs/aws-jwt-verify/blob/main/src/safe-json-parse.ts
// From https://github.com/awslabs/aws-jwt-verify/blob/main/src/jwt-model.ts

import { Credentials } from '@aws-sdk/types';
import { KeyValueStorageInterface } from '../../types';

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
	awsCreds?: Credentials;
	awsCredsIdentityId?: string;
	isSignedIn: boolean;
};

export type LibraryAuthOptions = {
	tokenProvider?: TokenProvider;
	credentialsProvider?: CredentialsProvider;
	identityIdProvider?: IdentityIdProvider;
	keyValueStorage?: KeyValueStorageInterface;
};

export interface CredentialsProvider {
	getCredentials: ({
		options,
		tokens,
		authConfig,
		identityId,
	}: {
		options?: FetchAuthSessionOptions;
		tokens?: AuthTokens;
		authConfig?: AuthConfig;
		identityId?: string;
	}) => Promise<Credentials>;
	clearCredentials: () => void;
}

export type TokenProvider = {
	getTokens: ({
		forceRefresh,
	}: {
		forceRefresh?: boolean;
	}) => Promise<AuthTokens>;
};

export type IdentityIdProvider = ({
	tokens,
	authConfig,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
}) => Promise<string>;

export type FetchAuthSessionOptions = {
	forceRefresh?: boolean;
};

export type AuthTokens = {
	idToken?: JWT;
	accessToken: JWT;
	accessTokenExpAt: number;
	clockDrift?: number;
	metadata?: Record<string, string>; // Generic for each service supported
};

export type AuthConfig =
	| IdentityPoolConfig
	| UserPoolConfig
	| UserPoolConfigAndIdentityPoolConfig;

type IdentityPoolConfig = {
	identityPoolId: string;
	userPoolWebClientId?: never;
	userPoolId?: never;
	clientMetadata?: never;
};

export type UserPoolConfig = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId?: never;
	clientMetadata?: Record<string, string>;
};

type UserPoolConfigAndIdentityPoolConfig = {
	userPoolWebClientId: string;
	userPoolId: string;
	identityPoolId: string;
	clientMetadata?: Record<string, string>;
};
