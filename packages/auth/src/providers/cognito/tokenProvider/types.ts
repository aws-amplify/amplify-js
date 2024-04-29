// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
	TokenProvider,
} from '@aws-amplify/core';

import { CognitoAuthSignInDetails } from '../types';

export type TokenRefresher = ({
	tokens,
	authConfig,
	username,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
	username: string;
}) => Promise<CognitoAuthTokens>;

export type AuthKeys<AuthKey extends string> = {
	[Key in AuthKey]: string;
};

export const AuthTokenStorageKeys = {
	accessToken: 'accessToken',
	idToken: 'idToken',
	oidcProvider: 'oidcProvider',
	clockDrift: 'clockDrift',
	refreshToken: 'refreshToken',
	deviceKey: 'deviceKey',
	randomPasswordKey: 'randomPasswordKey',
	deviceGroupKey: 'deviceGroupKey',
	signInDetails: 'signInDetails',
};

export interface AuthTokenStore {
	getLastAuthUser(): Promise<string>;
	loadTokens(): Promise<CognitoAuthTokens | null>;
	storeTokens(tokens: CognitoAuthTokens): Promise<void>;
	clearTokens(): Promise<void>;
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
	getDeviceMetadata(username?: string): Promise<DeviceMetadata | null>;
	clearDeviceMetadata(username?: string): Promise<void>;
}

export interface AuthTokenOrchestrator {
	setTokenRefresher(tokenRefresher: TokenRefresher): void;
	setAuthTokenStore(tokenStore: AuthTokenStore): void;
	getTokens(
		options?: FetchAuthSessionOptions,
	): Promise<
		(AuthTokens & { signInDetails?: CognitoAuthSignInDetails }) | null
	>;
	setTokens({ tokens }: { tokens: CognitoAuthTokens }): Promise<void>;
	clearTokens(): Promise<void>;
	getDeviceMetadata(username?: string): Promise<DeviceMetadata | null>;
	clearDeviceMetadata(username?: string): Promise<void>;
}

export interface CognitoUserPoolTokenProviderType extends TokenProvider {
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
	setAuthConfig(authConfig: AuthConfig): void;
}

export type CognitoAuthTokens = AuthTokens & {
	refreshToken?: string;
	deviceMetadata?: DeviceMetadata;
	clockDrift: number;
	username: string;
	signInDetails?: CognitoAuthSignInDetails;
};

export interface DeviceMetadata {
	deviceKey?: string;
	deviceGroupKey?: string;
	randomPassword: string;
}
