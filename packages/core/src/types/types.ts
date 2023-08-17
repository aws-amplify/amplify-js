// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

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

export interface KeyValueStorageInterface {
	setItem(key: string, value: string): Promise<void>;
	getItem(key: string): Promise<string | null>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>;
}

export type SameSite = 'strict' | 'lax' | 'none';

export type CookieStorageData = {
	domain?: string;
	path?: string;
	expires?: number;
	secure?: boolean;
	sameSite?: SameSite;
};
