// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
	TokenProvider,
} from '@aws-amplify/core';

export type TokenRefresher = ({
	tokens,
	authConfig,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
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
	deviceMetadata: 'deviceKey',
};

export interface AuthTokenStore {
	loadTokens(): Promise<CognitoAuthTokens | null>;
	storeTokens(tokens: CognitoAuthTokens): Promise<void>;
	clearTokens(): Promise<void>;
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
	getDeviceMetadata(): Promise<DeviceMetadata | null>;
	clearDeviceMetadata(): Promise<void>;
}

export interface AuthTokenOrchestrator {
	setTokenRefresher(tokenRefresher: TokenRefresher): void;
	setAuthTokenStore(tokenStore: AuthTokenStore): void;
	getTokens: (options?: FetchAuthSessionOptions) => Promise<AuthTokens | null>;
	setTokens: ({ tokens }: { tokens: CognitoAuthTokens }) => Promise<void>;
	clearTokens: () => Promise<void>;
	getDeviceMetadata(): Promise<DeviceMetadata | null>;
	clearDeviceMetadata(): Promise<void>;
}

export interface CognitoUserPoolTokenProviderType extends TokenProvider {
	setKeyValueStorage: (keyValueStorage: KeyValueStorageInterface) => void;
	setAuthConfig: (authConfig: AuthConfig) => void;
}

export type CognitoAuthTokens = AuthTokens & {
	refreshToken?: string;
	deviceMetadata?: DeviceMetadata;
	clockDrift: number;
};

export type DeviceMetadata = {
	deviceKey?: string;
	deviceGroupKey?: string;
	randomPassword: string;
};
