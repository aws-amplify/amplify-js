// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InputLogEvent, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { Credentials } from '@aws-sdk/types';
import { JWT } from '../Singleton/Auth/types';

export interface AmplifyConfig {
	Analytics?: object;
	Auth?: object;
	API?: object;
	Logging?: object;
	Storage?: object;
	Cache?: object;
	Geo?: object;
	Notifications?: {
		InAppMessaging?: object;
	};
	ssr?: boolean;
}

export interface ICredentials {
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
	identityId: string;
	authenticated: boolean;
	// Long term creds do not provide an expiration date
	expiration?: Date;
}

/**
 * @private
 * Internal use of Amplify only
 */

export type DelayFunction = (
	attempt: number,
	args?: any[],
	error?: Error
) => number | false;

export interface LoggingProvider {
	// return the name of you provider
	getProviderName(): string;

	// return the name of you category
	getCategoryName(): string;

	// configure the plugin
	configure(config?: object): object;

	// take logs and push to provider
	pushLogs(logs: InputLogEvent[]): void;
}

export interface AWSCloudWatchProviderOptions {
	logGroupName?: string;
	logStreamName?: string;
	region?: string;
	credentials?: Credentials;
	endpoint?: string;
}

export interface CloudWatchDataTracker {
	eventUploadInProgress: boolean;
	logEvents: InputLogEvent[];
	verifiedLogGroup?: LogGroup;
}

export type ErrorParams = {
	message: string;
	name: string;
	recoverySuggestion?: string;
	underlyingError?: Error | unknown;
};

export type AmplifyErrorMap<ErrorCode extends string> = {
	[name in ErrorCode]: {
		message: string;
		recoverySuggestion?: string;
	};
};

export type ServiceError = {
	name: string;
	message: string;
};

export type ResourceConfig = {
	API?: {};
	Analytics?: {};
	Auth?: {
		userPoolId?: string;
		identityPoolId?: string;
		userPoolWebClientId?: string;
	};
	DataStore?: {};
	Interactions?: {};
	Notifications?: {};
	Predictions?: {};
	Storage?: {};
};

export type LibraryOptions = {
	Auth?: {
		tokenRefresher?: TokenRefresher;
		credentialsProvider?: CredentialsProvider;
		identityIdProvider?: IdentityIdProvider;
		keyValueStorage?: KeyValueStorageInterface;
	} | null;
};

export interface AuthTokenOrchestrator {
	setTokenRefresher(tokenRefresher: TokenRefresher): void;
	setAuthTokenStore(tokenStore: AuthTokenStore): void;
	setAuthConfig(authConfig: AuthConfig): void;

	getTokens: ({
		options,
	}: {
		options?: GetAuthTokensOptions;
	}) => Promise<AuthTokens>;
	setTokens: ({ tokens }: { tokens: AuthTokens }) => Promise<void>;
	clearTokens: () => Promise<void>;
}

export type TokenRefresher = ({
	tokens,
	authConfig,
}: {
	tokens: AuthTokens;
	authConfig?: AuthConfig;
}) => Promise<AuthTokens>;

export type IdentityIdProvider = ({
	tokens,
	authConfig,
}: {
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
}) => Promise<string>;

export type CredentialsProvider = ({
	options,
	tokens,
	authConfig,
	identityId,
}: {
	options?: GetAuthTokensOptions;
	tokens?: AuthTokens;
	authConfig?: AuthConfig;
	identityId?: string;
}) => Promise<Credentials>;

export type GetAuthTokensOptions = {
	forceRefresh?: boolean;
};

export type AuthTokens = {
	idToken?: JWT;
	accessToken: JWT;
	accessTokenExpAt: number;
	clockDrift?: number;
	metadata?: Record<string, string>; // Generic for each service supported
};

export interface KeyValueStorageInterface {
	setItem(key: string, value: string): Promise<void>;
	getItem(key: string): Promise<string | null>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>;
}

export type AuthConfig = ResourceConfig['Auth'];

export interface AuthTokenStore {
	setAuthConfig(authConfig: AuthConfig): void;
	loadTokens(): Promise<AuthTokens>;
	storeTokens(tokens: AuthTokens): Promise<void>;
	clearTokens(): Promise<void>;
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
}

export type AuthSession = {
	tokens?: AuthTokens;
	awsCreds?: Credentials;
	awsCredsIdentityId?: string;
	authenticated: boolean;
};
