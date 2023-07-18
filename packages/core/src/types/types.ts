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
		tokenOrchestrator?: AuthTokenOrchestrator;
		tokenRefresher?: TokenRefresher;
		credentialsProvider?: CredentialsProvider;
		authTokenStore?: AuthTokenStore;
		keyValueStore?: KeyValueStorageInterface
	} | null;
};

export interface AuthTokenOrchestrator {
	getTokens: ({ options, tokenStore, keyValueStore }: { options?: GetAuthTokensOptions, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface }) => Promise<AuthTokens>;
	setTokens: ({ tokens, tokenStore, keyValueStore }: { tokens: AuthTokens, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface}) => Promise<void>;
	clearTokens:({ tokenStore, keyValueStore }: {tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface}) => Promise<void>;
}

export type TokenRefresher = (tokens: AuthTokens) => Promise<AuthTokens>;

export type CredentialsProvider = (options?: GetAuthTokensOptions) => Promise<ICredentials>;

export type GetAuthTokensOptions = {
	forceRefresh?: boolean;
};

export type AuthTokens = {
	idToken?: JWT;
	accessToken: JWT;
	accessTokenExpAt: number;
	oidcProvider: OidcProvider;
	metadata?: Record<string, string>
};

export type OidcProvider = 'COGNITO' | { custom: string };

export interface KeyValueStorageInterface {
	setItem(key: string, value: string): Promise<void>
	getItem(key: string): Promise<string | null>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>
}

export interface AuthTokenStore {
	loadTokens(keyValueStore: KeyValueStorageInterface): Promise<AuthTokens | null>;
	storeTokens(keyValueStore: KeyValueStorageInterface, tokens: AuthTokens): Promise<void>;
	clearTokens(keyValueStore: KeyValueStorageInterface): Promise<void>;
}

export type AuthSession = {
	tokens?: AuthTokens,
	awsCreds?: Credentials,
	awsCredsIdentityId?: string,
	authenticated: boolean
}