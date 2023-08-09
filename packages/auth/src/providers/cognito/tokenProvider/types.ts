import {
	AuthConfig,
	AuthTokens,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
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

export const AuthStorageKeys = {
	accessToken: 'accessToken',
	idToken: 'idToken',
	oidcProvider: 'oidcProvider',
	clockDrift: 'clockDrift',
	refreshToken: 'refreshToken',
	NewDeviceMetadata: 'NewDeviceMetadata',
};

export interface AuthTokenStore {
	loadTokens(): Promise<CognitoAuthTokens>;
	storeTokens(tokens: CognitoAuthTokens): Promise<void>;
	clearTokens(): Promise<void>;
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
}

export interface AuthTokenOrchestrator {
	setTokenRefresher(tokenRefresher: TokenRefresher): void;
	setAuthTokenStore(tokenStore: AuthTokenStore): void;
	getTokens: ({
		options,
	}: {
		options?: FetchAuthSessionOptions;
	}) => Promise<AuthTokens>;
	setTokens: ({ tokens }: { tokens: CognitoAuthTokens }) => Promise<void>;
	clearTokens: () => Promise<void>;
}

export type CognitoAuthTokens = AuthTokens & {
	refreshToken?: string;
	NewDeviceMetadata?: string;
	clockDrift: number;
};
