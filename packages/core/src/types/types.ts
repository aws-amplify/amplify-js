// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InputLogEvent, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { Credentials } from '@aws-sdk/types';

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
		tokenProvider?: TokenProvider;
		refreshTokenClient?: TokenRefreshClient;
		credentialsProvider?: CredentialsProvider;
		storage?: AuthStorage;
	} | null;
};

export interface TokenProvider {
	getTokens: (options?: GetTokensOptions) => Promise<AuthTokens>;
	setTokens: (tokens: AuthTokens) => Promise<void>;
}

export type TokenRefreshClient = (metadata?: Record<string, string>) => Promise<AuthTokens>;

export type CredentialsProvider = (options?: GetTokensOptions) => Promise<ICredentials>;

export type GetTokensOptions = {
	forceRefresh?: boolean;
};

export type AuthTokens = {
	idToken: string;
	accessToken: string;
	metadata?: Record<string, string>
};

export interface AuthStorage {
	setItem(key: string, value: string): Promise<void>
	getItem(key: string): Promise<string | null>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>
}
