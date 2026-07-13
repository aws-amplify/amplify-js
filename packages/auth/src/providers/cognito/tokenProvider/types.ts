// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthTokens,
	ClientMetadataProvider,
	FetchAuthSessionOptions,
	KeyValueStorageInterface,
	TokenProvider,
} from '@aws-amplify/core';
import { JWT } from '@aws-amplify/core/internals/utils';

import { ClientMetadata, CognitoAuthSignInDetails } from '../types';

export type TokenRefresher = ({
	tokens,
	authConfig,
	username,
	clientMetadata,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
	username: string;
	clientMetadata?: ClientMetadata;
}) => Promise<CognitoAuthTokens>;

export type AuthKeys<AuthKey extends string> = Record<AuthKey, string>;

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
	oauthMetadata: 'oauthMetadata',
};

export interface AuthTokenStore {
	getLastAuthUser(): Promise<string>;
	getAuthUserList(): Promise<string[]>;
	getStoredIdToken(username: string): Promise<JWT | undefined>;
	addActiveSession(username: string): Promise<void>;
	removeSession(
		username: string,
	): Promise<{ newActiveUser?: string; isEmpty: boolean }>;
	loadTokens(): Promise<CognitoAuthTokens | null>;
	storeTokens(tokens: CognitoAuthTokens): Promise<void>;
	clearTokens(): Promise<void>;
	clearTokensForUser(username: string): Promise<void>;
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
	getDeviceMetadata(username?: string): Promise<DeviceMetadata | null>;
	clearDeviceMetadata(username?: string): Promise<void>;
	setOAuthMetadata(metadata: OAuthMetadata): Promise<void>;
	getOAuthMetadata(): Promise<OAuthMetadata | null>;
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
	setOAuthMetadata(metadata: OAuthMetadata): Promise<void>;
	getOAuthMetadata(): Promise<OAuthMetadata | null>;
}

export interface CognitoUserPoolTokenProviderType extends TokenProvider {
	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface): void;
	setAuthConfig(authConfig: AuthConfig): void;
	setClientMetadataProvider(
		clientMetadataProvider: ClientMetadataProvider,
	): void;
}

/**
 * A deliberately narrow, Cognito-only capability for reading and switching the
 * active session within an existing roster.
 *
 * It exposes ONLY read access and a membership-checked reorder. It intentionally
 * omits every destructive token-store operation (storeTokens / clearTokens /
 * clearTokensForUser / removeSession) so that a server context can switch the
 * active session without any ability to mint or delete sessions.
 *
 * This is NOT part of the generic {@link TokenProvider} contract in `core`; it
 * is surfaced separately by the Cognito server token provider.
 */
export interface AuthSessionSwitcher {
	/**
	 * Reads the ordered session roster (active user first) without triggering a
	 * token refresh.
	 */
	listSessionUsernames(): Promise<string[]>;
	/**
	 * Reads and decodes a specific user's stored id token without triggering a
	 * refresh. Resolves to `undefined` when absent/undecodable.
	 *
	 * @param username - The username whose stored id token should be read.
	 */
	getStoredIdToken(username: string): Promise<JWT | undefined>;
	/**
	 * Promotes an ALREADY signed-in user to the active session (roster head).
	 *
	 * This is a membership-checked reorder: it throws when `username` is not part
	 * of the current roster and NEVER adds a non-signed-in user or deletes tokens.
	 *
	 * @param username - The signed-in username to make active.
	 * @throws {@link AuthError} - With name `UserNotSignedInException` when the
	 * username has no signed-in session in the roster.
	 */
	setActiveSession(username: string): Promise<void>;
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

export interface OAuthMetadata {
	oauthSignIn: boolean;
}
