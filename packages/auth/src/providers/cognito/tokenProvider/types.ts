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
	tokens: AuthTokens;
	authConfig?: AuthConfig;
}) => Promise<AuthTokens>;

export type AuthKeys<AuthKey extends string> = {
	[Key in AuthKey]: string;
};

export const AuthStorageKeys = {
	accessToken: 'accessToken',
	idToken: 'idToken',
	accessTokenExpAt: 'accessTokenExpAt',
	oidcProvider: 'oidcProvider',
	clockDrift: 'clockDrift',
	metadata: 'metadata',
};

export interface AuthTokenStore {
	loadTokens(): Promise<AuthTokens>;
	storeTokens(tokens: AuthTokens): Promise<void>;
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
	setTokens: ({ tokens }: { tokens: AuthTokens }) => Promise<void>;
	clearTokens: () => Promise<void>;
}
