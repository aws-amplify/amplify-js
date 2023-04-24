// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InputLogEvent, LogGroup } from '@aws-sdk/client-cloudwatch-logs';
import { Credentials } from '@aws-sdk/types';
import type { Observable } from 'rxjs';

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

// TODO: the following types are TBD this is only an initial draft
export interface JWT {
	payload: JSON;
	header: JSON;
	signature: string;
	toString: () => string;
	isValid: () => boolean;
}

export type JWTS = {
	accessToken?: JWT;
	idToken?: JWT;
};

export type AmplifyUserSession = {
	isLoggedIn: boolean;
	username?: string;
	credentials?: ICredentials;
	jwts?: JWTS;
};

export type GetUserSessionOptions = {
	refresh?: boolean;
};

export interface AmplifyUserSessionProvider {
	getUserSession: (
		options?: GetUserSessionOptions
	) => Promise<AmplifyUserSession>;
	listenUserSession(): Observable<AmplifyUserSession>;
}

export type LibraryOptions = {
	Auth: {
		sessionProvider?: AmplifyUserSessionProvider;
	} | null;
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
