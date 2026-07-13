// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthConfig, KeyValueStorageInterface } from '@aws-amplify/core';
import {
	JWT,
	assertTokenProviderConfig,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../errors/AuthError';

import {
	AuthKeys,
	AuthTokenStorageKeys,
	AuthTokenStore,
	CognitoAuthTokens,
	DeviceMetadata,
	OAuthMetadata,
} from './types';
import { TokenProviderErrorCode, assert } from './errorHelpers';
import { AUTH_KEY_PREFIX } from './constants';

export class DefaultTokenStore implements AuthTokenStore {
	private authConfig?: AuthConfig;
	keyValueStorage?: KeyValueStorageInterface;

	getKeyValueStorage(): KeyValueStorageInterface {
		if (!this.keyValueStorage) {
			throw new AuthError({
				name: 'KeyValueStorageNotFoundException',
				message: 'KeyValueStorage was not found in TokenStore',
			});
		}

		return this.keyValueStorage;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}

	setAuthConfig(authConfig: AuthConfig) {
		this.authConfig = authConfig;
	}

	async loadTokens(): Promise<CognitoAuthTokens | null> {
		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format
		try {
			const authKeys = await this.getAuthKeys();
			const accessTokenString = await this.getKeyValueStorage().getItem(
				authKeys.accessToken,
			);

			if (!accessTokenString) {
				throw new AuthError({
					name: 'NoSessionFoundException',
					message: 'Auth session was not found. Make sure to call signIn.',
				});
			}

			const accessToken = decodeJWT(accessTokenString);
			const itString = await this.getKeyValueStorage().getItem(
				authKeys.idToken,
			);
			const idToken = itString ? decodeJWT(itString) : undefined;

			const refreshToken =
				(await this.getKeyValueStorage().getItem(authKeys.refreshToken)) ??
				undefined;

			const clockDriftString =
				(await this.getKeyValueStorage().getItem(authKeys.clockDrift)) ?? '0';
			const clockDrift = Number.parseInt(clockDriftString);

			const signInDetails = await this.getKeyValueStorage().getItem(
				authKeys.signInDetails,
			);
			const tokens: CognitoAuthTokens = {
				accessToken,
				idToken,
				refreshToken,
				deviceMetadata: (await this.getDeviceMetadata()) ?? undefined,
				clockDrift,
				username: await this.getLastAuthUser(),
			};

			if (signInDetails) {
				tokens.signInDetails = JSON.parse(signInDetails);
			}

			return tokens;
		} catch (err) {
			return null;
		}
	}

	async storeTokens(tokens: CognitoAuthTokens): Promise<void> {
		assert(tokens !== undefined, TokenProviderErrorCode.InvalidAuthTokens);

		// Note: storeTokens intentionally does NOT manage the active user pointer
		// (LastAuthUser / AuthUserList). The active pointer is owned exclusively by
		// the roster methods (persistAuthUserList). This prevents token refresh from
		// reordering the session roster.
		const authKeys = await this.getAuthKeys();
		await this.getKeyValueStorage().setItem(
			authKeys.accessToken,
			tokens.accessToken.toString(),
		);

		if (tokens.idToken) {
			await this.getKeyValueStorage().setItem(
				authKeys.idToken,
				tokens.idToken.toString(),
			);
		} else {
			await this.getKeyValueStorage().removeItem(authKeys.idToken);
		}

		if (tokens.refreshToken) {
			await this.getKeyValueStorage().setItem(
				authKeys.refreshToken,
				tokens.refreshToken,
			);
		} else {
			await this.getKeyValueStorage().removeItem(authKeys.refreshToken);
		}

		if (tokens.deviceMetadata) {
			if (tokens.deviceMetadata.deviceKey) {
				await this.getKeyValueStorage().setItem(
					authKeys.deviceKey,
					tokens.deviceMetadata.deviceKey,
				);
			}
			if (tokens.deviceMetadata.deviceGroupKey) {
				await this.getKeyValueStorage().setItem(
					authKeys.deviceGroupKey,
					tokens.deviceMetadata.deviceGroupKey,
				);
			}

			await this.getKeyValueStorage().setItem(
				authKeys.randomPasswordKey,
				tokens.deviceMetadata.randomPassword,
			);
		}

		if (tokens.signInDetails) {
			await this.getKeyValueStorage().setItem(
				authKeys.signInDetails,
				JSON.stringify(tokens.signInDetails),
			);
		} else {
			await this.getKeyValueStorage().removeItem(authKeys.signInDetails);
		}

		await this.getKeyValueStorage().setItem(
			authKeys.clockDrift,
			`${tokens.clockDrift}`,
		);
	}

	async clearTokens(): Promise<void> {
		const authKeys = await this.getAuthKeys();
		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.accessToken),
			this.getKeyValueStorage().removeItem(authKeys.idToken),
			this.getKeyValueStorage().removeItem(authKeys.clockDrift),
			this.getKeyValueStorage().removeItem(authKeys.refreshToken),
			this.getKeyValueStorage().removeItem(authKeys.signInDetails),
			this.getKeyValueStorage().removeItem(this.getLastAuthUserKey()),
			this.getKeyValueStorage().removeItem(this.getAuthUserListKey()),
			this.getKeyValueStorage().removeItem(authKeys.oauthMetadata),
		]);
	}

	/**
	 * Clears ONLY the per-user token namespace for the provided username.
	 *
	 * Unlike {@link clearTokens}, this does NOT touch the active pointer keys
	 * (LastAuthUser / AuthUserList); roster management is handled separately by
	 * {@link removeSession}.
	 *
	 * @param username - The username whose namespaced token keys should be removed.
	 */
	async clearTokensForUser(username: string): Promise<void> {
		const authKeys = await this.getAuthKeys(username);
		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.accessToken),
			this.getKeyValueStorage().removeItem(authKeys.idToken),
			this.getKeyValueStorage().removeItem(authKeys.clockDrift),
			this.getKeyValueStorage().removeItem(authKeys.refreshToken),
			this.getKeyValueStorage().removeItem(authKeys.signInDetails),
			this.getKeyValueStorage().removeItem(authKeys.deviceKey),
			this.getKeyValueStorage().removeItem(authKeys.deviceGroupKey),
			this.getKeyValueStorage().removeItem(authKeys.randomPasswordKey),
			this.getKeyValueStorage().removeItem(authKeys.oauthMetadata),
		]);
	}

	/**
	 * Loads and decodes the stored idToken for a specific user without
	 * triggering a refresh. Returns undefined if absent/undecodable.
	 *
	 * @param username - The username whose stored idToken should be read.
	 */
	async getStoredIdToken(username: string): Promise<JWT | undefined> {
		try {
			const authKeys = await this.getAuthKeys(username);
			const idTokenString = await this.getKeyValueStorage().getItem(
				authKeys.idToken,
			);

			return idTokenString ? decodeJWT(idTokenString) : undefined;
		} catch (err) {
			return undefined;
		}
	}

	async getDeviceMetadata(username?: string): Promise<DeviceMetadata | null> {
		const authKeys = await this.getAuthKeys(username);
		const deviceKey = await this.getKeyValueStorage().getItem(
			authKeys.deviceKey,
		);
		const deviceGroupKey = await this.getKeyValueStorage().getItem(
			authKeys.deviceGroupKey,
		);
		const randomPassword = await this.getKeyValueStorage().getItem(
			authKeys.randomPasswordKey,
		);

		return randomPassword && deviceGroupKey && deviceKey
			? {
					deviceKey,
					deviceGroupKey,
					randomPassword,
				}
			: null;
	}

	async clearDeviceMetadata(username?: string): Promise<void> {
		const authKeys = await this.getAuthKeys(username);
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.deviceKey),
			this.getKeyValueStorage().removeItem(authKeys.deviceGroupKey),
			this.getKeyValueStorage().removeItem(authKeys.randomPasswordKey),
		]);
	}

	private async getAuthKeys(
		username?: string,
	): Promise<AuthKeys<keyof typeof AuthTokenStorageKeys>> {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const lastAuthUser = username ?? (await this.getLastAuthUser());

		return createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			`${this.authConfig.Cognito.userPoolClientId}.${lastAuthUser}`,
		);
	}

	private getLastAuthUserKey() {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const identifier = this.authConfig.Cognito.userPoolClientId;

		return `${AUTH_KEY_PREFIX}.${identifier}.LastAuthUser`;
	}

	/**
	 * Builds the storage key for the clientId-scoped session roster
	 * (comma-separated ordered list of usernames, active user first).
	 *
	 * Mirrors {@link getLastAuthUserKey} but is NOT scoped to a username.
	 */
	private getAuthUserListKey() {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const identifier = this.authConfig.Cognito.userPoolClientId;

		return `${AUTH_KEY_PREFIX}.${identifier}.AuthUserList`;
	}

	/**
	 * Returns the ordered session roster (active user first).
	 *
	 * If the AuthUserList key is present it is parsed directly. If it is absent
	 * but a legacy LastAuthUser value exists (and is not the literal 'username'
	 * fallback), that single user is migrated into a roster and persisted.
	 * Otherwise an empty roster is returned.
	 */
	async getAuthUserList(): Promise<string[]> {
		const authUserListString = await this.getKeyValueStorage().getItem(
			this.getAuthUserListKey(),
		);

		if (authUserListString) {
			return authUserListString.split(',').filter(Boolean);
		}

		// Migration: fall back to a legacy single LastAuthUser value if present.
		const legacyLastAuthUser = await this.getKeyValueStorage().getItem(
			this.getLastAuthUserKey(),
		);
		if (legacyLastAuthUser && legacyLastAuthUser !== 'username') {
			const migratedList = [legacyLastAuthUser];
			await this.persistAuthUserList(migratedList);

			return migratedList;
		}

		return [];
	}

	/**
	 * Persists the session roster. This is the ONLY writer of the AuthUserList
	 * and LastAuthUser keys, keeping the invariant LastAuthUser === list[0].
	 *
	 * When the roster is empty both keys are removed.
	 *
	 * @param list - The ordered roster to persist (active user first).
	 */
	private async persistAuthUserList(list: string[]): Promise<void> {
		if (list.length === 0) {
			// Remove LastAuthUser FIRST: if the subsequent AuthUserList delete
			// fails, a lingering AuthUserList is harmless, but a lingering legacy
			// LastAuthUser would re-migrate a removed user back into the roster.
			await this.getKeyValueStorage().removeItem(this.getLastAuthUserKey());
			await this.getKeyValueStorage().removeItem(this.getAuthUserListKey());

			return;
		}

		await this.getKeyValueStorage().setItem(
			this.getAuthUserListKey(),
			list.join(','),
		);
		await this.getKeyValueStorage().setItem(this.getLastAuthUserKey(), list[0]);
	}

	/**
	 * Adds (or re-activates) a session for the given username, deduping and
	 * moving it to the front of the roster so it becomes the active user.
	 *
	 * @param username - The username to mark as the active session.
	 */
	async addActiveSession(username: string): Promise<void> {
		const list = await this.getAuthUserList();
		await this.persistAuthUserList([
			username,
			...list.filter(user => user !== username),
		]);
	}

	/**
	 * Removes a session for the given username from the roster.
	 *
	 * @param username - The username whose session should be removed.
	 * @returns The new active user (roster head, if any) and whether the roster
	 * is now empty.
	 */
	async removeSession(
		username: string,
	): Promise<{ newActiveUser?: string; isEmpty: boolean }> {
		const list = await this.getAuthUserList();
		const newList = list.filter(user => user !== username);
		await this.persistAuthUserList(newList);

		return { newActiveUser: newList[0], isEmpty: newList.length === 0 };
	}

	async getLastAuthUser(): Promise<string> {
		return (await this.getAuthUserList())[0] ?? 'username';
	}

	async setOAuthMetadata(metadata: OAuthMetadata): Promise<void> {
		const { oauthMetadata: oauthMetadataKey } = await this.getAuthKeys();
		await this.getKeyValueStorage().setItem(
			oauthMetadataKey,
			JSON.stringify(metadata),
		);
	}

	async getOAuthMetadata(): Promise<OAuthMetadata | null> {
		const { oauthMetadata: oauthMetadataKey } = await this.getAuthKeys();
		const oauthMetadata =
			await this.getKeyValueStorage().getItem(oauthMetadataKey);

		return oauthMetadata && JSON.parse(oauthMetadata);
	}
}

export const createKeysForAuthStorage = (
	provider: string,
	identifier: string,
) => {
	return getAuthStorageKeys(AuthTokenStorageKeys)(`${provider}`, identifier);
};

export function getAuthStorageKeys<T extends Record<string, string>>(
	authKeys: T,
) {
	const keys = Object.values({ ...authKeys });

	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, authKey) => ({
				...acc,
				[authKey]: `${prefix}.${identifier}.${authKey}`,
			}),
			{} as AuthKeys<keyof T & string>,
		);
}
