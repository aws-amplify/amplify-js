// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '../../types';
import { AtLeastOne } from '../types';

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
	sub?: string; // JWT sub https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2
}

type JsonPrimitive = null | string | number | boolean;

/** JSON array type */
type JsonArray = (JsonPrimitive | JsonObject | JsonArray)[];

/** JSON Object type */
interface JsonObject {
	[x: string]: JsonPrimitive | JsonArray | JsonObject;
}

export type JwtPayload = JwtPayloadStandardFields & JsonObject;

export interface JWT {
	payload: JwtPayload;
	toString(): string;
}

export type JWTCreator = (stringJWT: string) => JWT;

export interface AuthSession {
	tokens?: AuthTokens;
	credentials?: AWSCredentials;
	identityId?: string;
	userSub?: string;
}

export interface LibraryAuthOptions {
	tokenProvider?: TokenProvider;
	credentialsProvider?: CredentialsAndIdentityIdProvider;
}

export interface Identity {
	id: string;
	type: 'guest' | 'primary';
}

export interface CredentialsAndIdentityIdProvider {
	getCredentialsAndIdentityId(
		getCredentialsOptions: GetCredentialsOptions,
	): Promise<CredentialsAndIdentityId | undefined>;
	clearCredentialsAndIdentityId(): void;
}

export interface TokenProvider {
	getTokens({
		forceRefresh,
	}?: {
		forceRefresh?: boolean;
	}): Promise<AuthTokens | null>;
}

export interface FetchAuthSessionOptions {
	forceRefresh?: boolean;
}

export interface AuthTokens {
	idToken?: JWT;
	accessToken: JWT;
	/**
	 * @deprecated
	 * Use getCurrentUser to access signInDetails
	 */
	signInDetails?: AWSAuthSignInDetails;
}

export type AuthStandardAttributeKey =
	| 'address'
	| 'birthdate'
	| 'email_verified'
	| 'family_name'
	| 'gender'
	| 'given_name'
	| 'locale'
	| 'middle_name'
	| 'name'
	| 'nickname'
	| 'phone_number_verified'
	| 'picture'
	| 'preferred_username'
	| 'profile'
	| 'sub'
	| 'updated_at'
	| 'website'
	| 'zoneinfo'
	| AuthVerifiableAttributeKey;

// legacy config user attribute keys are uppercase
export type LegacyUserAttributeKey = Uppercase<AuthStandardAttributeKey>;

export type AuthVerifiableAttributeKey = 'email' | 'phone_number';

type UserGroupName = string;
type UserGroupPrecedence = Record<string, number>;

export type AuthConfigUserAttributes = Partial<
	Record<AuthStandardAttributeKey, { required: boolean }>
>;

export type AuthConfig = AtLeastOne<CognitoProviderConfig>;

export type CognitoProviderConfig = StrictUnion<
	| AuthIdentityPoolConfig
	| AuthUserPoolConfig
	| AuthUserPoolAndIdentityPoolConfig
>;

export interface AuthIdentityPoolConfig {
	Cognito: CognitoIdentityPoolConfig & {
		userPoolClientId?: never;
		userPoolId?: never;
		userPoolEndpoint?: never;
		loginWith?: never;
		signUpVerificationMethod?: never;
		userAttributes?: never;
		mfa?: never;
		passwordFormat?: never;
		groups?: never;
	};
}

export interface CognitoIdentityPoolConfig {
	identityPoolId: string;
	allowGuestAccess?: boolean;
}

export interface AuthUserPoolConfig {
	Cognito: CognitoUserPoolConfig & {
		identityPoolId?: never;
		allowGuestAccess?: never;
	};
}

export type CognitoUserPoolConfigMfaStatus = 'on' | 'off' | 'optional';

export interface CognitoUserPoolConfig {
	userPoolClientId: string;
	userPoolId: string;
	userPoolEndpoint?: string;
	signUpVerificationMethod?: 'code' | 'link';
	loginWith?: {
		oauth?: OAuthConfig;
		username?: boolean;
		email?: boolean;
		phone?: boolean;
	};
	userAttributes?: AuthConfigUserAttributes;
	mfa?: {
		status?: CognitoUserPoolConfigMfaStatus;
		totpEnabled?: boolean;
		smsEnabled?: boolean;
	};
	passwordFormat?: {
		minLength?: number;
		requireLowercase?: boolean;
		requireUppercase?: boolean;
		requireNumbers?: boolean;
		requireSpecialCharacters?: boolean;
	};
	groups?: Record<UserGroupName, UserGroupPrecedence>[];
}

export interface OAuthConfig {
	domain: string;
	scopes: OAuthScope[];
	redirectSignIn: string[];
	redirectSignOut: string[];
	responseType: 'code' | 'token';
	providers?: (OAuthProvider | CustomProvider)[];
}

export type OAuthProvider = 'Google' | 'Facebook' | 'Amazon' | 'Apple';
interface CustomProvider {
	custom: string;
}

// CustomScope is a non-nullish string, using `& NonNullable<unknown>` to ensure
// `OAuthScope` is not resolved as a `string`
type CustomScope = string & NonNullable<unknown>;
export type OAuthScope =
	| 'email'
	| 'openid'
	| 'phone'
	| 'profile'
	| 'aws.cognito.signin.user.admin'
	| CustomScope;

export type CognitoUserPoolWithOAuthConfig = CognitoUserPoolConfig & {
	loginWith: {
		oauth: OAuthConfig;
	};
};
export interface AuthUserPoolAndIdentityPoolConfig {
	Cognito: CognitoUserPoolAndIdentityPoolConfig;
}

export type CognitoUserPoolAndIdentityPoolConfig = CognitoUserPoolConfig &
	CognitoIdentityPoolConfig;

export type GetCredentialsOptions =
	| GetCredentialsAuthenticatedUser
	| GetCredentialsUnauthenticatedUser;

interface GetCredentialsAuthenticatedUser {
	authenticated: true;
	forceRefresh?: boolean;
	authConfig: AuthConfig | undefined;
	tokens: AuthTokens;
}

interface GetCredentialsUnauthenticatedUser {
	authenticated: false;
	forceRefresh?: boolean;
	authConfig: AuthConfig | undefined;
	tokens?: never;
}

export interface CredentialsAndIdentityId {
	credentials: AWSCredentials;
	identityId?: string;
}

export interface AWSCredentials {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	expiration?: Date;
}

// copied from packages/auth/src/providers/cognito/types/models.ts#L94
/**
 * @deprecated
 */
interface AWSAuthSignInDetails {
	loginId?: string;
	authFlowType?: AuthFlowType;
}

// copied from packages/auth/src/providers/cognito/types/models.ts#L22
/**
 * @deprecated
 */
type AuthFlowType =
	| 'USER_AUTH'
	| 'USER_SRP_AUTH'
	| 'CUSTOM_WITH_SRP'
	| 'CUSTOM_WITHOUT_SRP'
	| 'USER_PASSWORD_AUTH';
