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
		//
		// Keys are resolved from tokens.username (the user these tokens belong to),
		// INDEPENDENT of the active pointer. A fresh sign-in caches tokens BEFORE
		// addActiveSession moves the pointer, so a no-arg getAuthKeys() would namespace
		// under the stale/sentinel pointer and the tokens would be unreachable once the
		// pointer advances to the new user's (empty) namespace (per HLD §4.3).
		const authKeys = await this.getAuthKeys(tokens.username);
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
		// Device-tracking keys (deviceKey/deviceGroupKey/randomPasswordKey) are
		// deliberately PRESERVED here, mirroring legacy `clearTokens` semantics: a
		// remembered device must survive sign-out so the next sign-in can skip MFA.
		// Only forgetDevice/deleteUser clear device metadata (via clearDeviceMetadata).
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.accessToken),
			this.getKeyValueStorage().removeItem(authKeys.idToken),
			this.getKeyValueStorage().removeItem(authKeys.clockDrift),
			this.getKeyValueStorage().removeItem(authKeys.refreshToken),
			this.getKeyValueStorage().removeItem(authKeys.signInDetails),
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

	/**
	 * Returns true when a live session exists for the username, detected by the
	 * presence of the ACCESS TOKEN key. This is the correct liveness signal for
	 * pruning: loadTokens only requires an accessToken, and the idToken is
	 * OPTIONAL (storeTokens removes the idToken key when a session lacks one), so
	 * a valid accessToken+refreshToken session may legitimately have no idToken
	 * and must NOT be evicted. Read-only, no decode.
	 *
	 * @param username - The username whose session presence should be checked.
	 */
	private async hasStoredSession(username: string): Promise<boolean> {
		const authKeys = await this.getAuthKeys(username);

		return (
			(await this.getKeyValueStorage().getItem(authKeys.accessToken)) != null
		);
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
	 * Returns the session roster (AuthUserList). The roster is the set of
	 * signed-in sessions; it is NOT the active pointer. Under the pointer model
	 * the roster may be non-empty while nobody is active (parked sessions after a
	 * sign-out), so this method deliberately does NOT derive or promote an active
	 * user — {@link getLastAuthUser} reads the LastAuthUser pointer directly.
	 *
	 * If the AuthUserList key is present it is parsed directly. If it is absent
	 * but a legacy LastAuthUser value exists (and is not the literal 'username'
	 * fallback), that single user is migrated into a roster and persisted; the
	 * pointer is left as-is so that user remains active.
	 *
	 * Every read is also a reconciliation point, but reconciliation now respects
	 * pointer semantics. External writers (older Amplify versions and
	 * amazon-cognito-identity-js sharing the same storage) mutate LastAuthUser
	 * directly, and a partial persist can leave skew. Reconciliation runs ONLY
	 * when the pointer is NON-EMPTY and NON-SENTINEL: if it names a user absent
	 * from the roster it is added to the front (external sign-in); if present but
	 * not the head it is moved to the head. An EMPTY pointer alongside a non-empty
	 * roster is a LEGITIMATE state (parked sessions, nobody active) and is left
	 * untouched — never promoted. On the (rare) promotion path the roster is
	 * pruned of entries whose tokens are no longer resolvable, and if the pointer
	 * user itself was pruned the pointer is CLEARED rather than left naming a
	 * removed user. All writes are best-effort (SSR storage may be read-only). The
	 * hot path (pointer already in sync, or empty) does no per-entry reads.
	 */
	async getAuthUserList(): Promise<string[]> {
		const authUserListString = await this.getKeyValueStorage().getItem(
			this.getAuthUserListKey(),
		);
		const lastAuthUser = await this.getKeyValueStorage().getItem(
			this.getLastAuthUserKey(),
		);

		if (authUserListString) {
			const parsedList = authUserListString.split(',').filter(Boolean);
			let reconciledList = parsedList;
			// Whether the (non-empty) pointer must be cleared because its own user
			// was pruned during reconciliation (a pointer must never name a user
			// absent from the roster).
			let clearStalePointer = false;

			// Reconcile drift ONLY for a real active pointer. An empty pointer or the
			// 'username' sentinel means "nobody active" and is a legitimate state
			// under the pointer model, so it is never promoted from the roster.
			const shouldReconcile =
				!!lastAuthUser &&
				lastAuthUser !== 'username' &&
				lastAuthUser !== parsedList[0];

			if (shouldReconcile) {
				// Promote to front (move if already present, otherwise prepend).
				reconciledList = [
					lastAuthUser,
					...parsedList.filter(user => user !== lastAuthUser),
				];

				// Prune entries with no live session — only on the (rare) promotion
				// path, to keep the hot path free of per-entry reads. Liveness is the
				// ACCESS TOKEN key (idToken is optional), see hasStoredSession.
				const prunedList: string[] = [];
				for (const entry of reconciledList) {
					if (await this.hasStoredSession(entry)) {
						prunedList.push(entry);
					}
				}
				reconciledList = prunedList;

				// If the pointer's own user was pruned, the stored pointer is now
				// stale: mark it for clearing rather than leaving it pointing at a
				// user no longer in the roster.
				clearStalePointer = !reconciledList.includes(lastAuthUser);
			}

			// Re-persist when reconciliation changed the roster contents, or when a
			// stale pointer must be cleared. persistAuthUserList writes only the
			// roster (the pointer is single-writer — owned by addActiveSession), so
			// a surviving promoted pointer is left as the external writer set it.
			// When reconciledList is empty, persistAuthUserList([]) clears both keys.
			if (
				reconciledList.join(',') !== parsedList.join(',') ||
				clearStalePointer
			) {
				// Best-effort: read-only/ephemeral SSR storage may reject the write;
				// the reconciled list is still returned to the caller.
				try {
					await this.persistAuthUserList(reconciledList);
					if (clearStalePointer && reconciledList.length > 0) {
						// Non-empty roster keeps the pointer key (persist didn't touch
						// it), so clear the stale pointer explicitly.
						await this.clearActiveUser();
					}
				} catch {
					// Storage is read-only (e.g. SSR); degrade gracefully.
				}
			}

			return reconciledList;
		}

		// Migration: fall back to a legacy single LastAuthUser value if present.
		if (lastAuthUser && lastAuthUser !== 'username') {
			const migratedList = [lastAuthUser];
			// Best-effort persist: on read-only/ephemeral SSR storage the write
			// may fail — that's acceptable because the migrated list is still
			// returned to the caller; the next mutable-storage call will retry.
			try {
				await this.persistAuthUserList(migratedList);
			} catch {
				// Storage is read-only (e.g. SSR); degrade gracefully.
			}

			return migratedList;
		}

		return [];
	}

	/**
	 * Persists the session roster (AuthUserList). This is the ONLY writer of the
	 * AuthUserList key, and the SINGLE WRITER of the LastAuthUser pointer.
	 *
	 * Pointer discipline: the LastAuthUser pointer is written here ONLY when the
	 * caller explicitly passes `setPointerTo` (addActiveSession does this so the
	 * pointer + roster head are written together). removeSession's persist omits
	 * it, so removing a session NEVER promotes a parked user into the pointer.
	 *
	 * When the roster is empty both keys are removed (pointer first) regardless of
	 * `setPointerTo`.
	 *
	 * @param list - The roster to persist (by convention the active user, when
	 * any, is the head).
	 * @param options - When `setPointerTo` is provided, the LastAuthUser pointer
	 * is set to it in the same write.
	 */
	private async persistAuthUserList(
		list: string[],
		options?: { setPointerTo?: string },
	): Promise<void> {
		if (list.length === 0) {
			// Remove LastAuthUser FIRST: if the subsequent AuthUserList delete
			// fails, a lingering AuthUserList is harmless, but a lingering legacy
			// LastAuthUser would re-migrate a removed user back into the roster.
			await this.getKeyValueStorage().removeItem(this.getLastAuthUserKey());
			await this.getKeyValueStorage().removeItem(this.getAuthUserListKey());

			return;
		}

		// Write the pointer FIRST (when requested), then AuthUserList. On a partial
		// failure the newer intent survives in LastAuthUser (the pointer legacy/
		// external consumers read), and getAuthUserList's drift reconciliation
		// repairs AuthUserList from it on the next read. The pointer is written
		// ONLY on this explicit-request path to preserve single-writer discipline;
		// removeSession's persist leaves the pointer for clearActiveUser to manage.
		if (options?.setPointerTo !== undefined) {
			await this.getKeyValueStorage().setItem(
				this.getLastAuthUserKey(),
				options.setPointerTo,
			);
		}
		await this.getKeyValueStorage().setItem(
			this.getAuthUserListKey(),
			list.join(','),
		);
	}

	/**
	 * Adds (or re-activates) a session for the given username, deduping and
	 * moving it to the front of the roster AND setting it as the active pointer
	 * (LastAuthUser). The pointer and roster head are written together.
	 *
	 * @param username - The username to mark as the active session.
	 */
	async addActiveSession(username: string): Promise<void> {
		const list = await this.getAuthUserList();
		await this.persistAuthUserList(
			[username, ...list.filter(user => user !== username)],
			{ setPointerTo: username },
		);
	}

	/**
	 * Removes a session for the given username from the roster. Under the pointer
	 * model this NEVER chooses or promotes a next active user and NEVER touches
	 * the LastAuthUser pointer (clearing/repointing the active user is the
	 * caller's responsibility via {@link clearActiveUser} / addActiveSession).
	 *
	 * @param username - The username whose session should be removed.
	 * @returns Whether the roster is now empty.
	 */
	async removeSession(username: string): Promise<{ isEmpty: boolean }> {
		const list = await this.getAuthUserList();
		const newList = list.filter(user => user !== username);
		await this.persistAuthUserList(newList);

		return { isEmpty: newList.length === 0 };
	}

	/**
	 * Reads the RAW active-user pointer (LastAuthUser) without the sentinel
	 * fallback, returning `undefined` when the pointer is empty/absent or holds
	 * the legacy 'username' sentinel. Used to distinguish "nobody active" from an
	 * actual active user (see dispatchSignedInHubEvent / setCurrentUser); does NOT
	 * derive from the roster.
	 */
	async getActiveUsername(): Promise<string | undefined> {
		const lastAuthUser = await this.getKeyValueStorage().getItem(
			this.getLastAuthUserKey(),
		);

		return lastAuthUser && lastAuthUser !== 'username'
			? lastAuthUser
			: undefined;
	}

	/**
	 * Clears the active-user pointer (LastAuthUser key) ONLY, leaving the
	 * AuthUserList roster intact so parked sessions survive. After this,
	 * getLastAuthUser returns the 'username' sentinel and getCurrentUser/
	 * fetchAuthSession behave as signed-out until setCurrentUser is called.
	 */
	async clearActiveUser(): Promise<void> {
		await this.getKeyValueStorage().removeItem(this.getLastAuthUserKey());
	}

	async getLastAuthUser(): Promise<string> {
		// Read the pointer DIRECTLY; return the legacy 'username' sentinel when the
		// pointer is empty/absent EVEN IF the roster still holds parked sessions.
		// Never falls back to the roster head.
		return (await this.getActiveUsername()) ?? 'username';
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
