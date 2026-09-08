// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoUserPoolConfig,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AUTH_KEY_PREFIX } from '../tokenProvider/constants';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';

import { OAuthStorageKeys, OAuthStore } from './types';

const V5_HOSTED_UI_KEY = 'amplify-signin-with-hostedUI';

// Bounds how long OTHER auth work (fetchAuthSession, getCurrentUser, ...) may
// block on an inflight OAuth flow, aligned with the validity period of a
// Cognito authorization code. It does NOT bound the flow itself: the
// completion path (`attemptCompleteOAuthFlow`) deliberately keeps gating on
// the raw `loadOAuthInFlight` flag and ignores this deadline, so a
// slow-but-successful Hosted UI login still completes after it passes.
export const OAUTH_INFLIGHT_TTL_MS = 5 * 60 * 1000;

export class DefaultOAuthStore implements OAuthStore {
	keyValueStorage: KeyValueStorageInterface;
	cognitoConfig?: CognitoUserPoolConfig;

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}

	async clearOAuthInflightData(): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.inflightOAuth),
			this.keyValueStorage.removeItem(authKeys.inflightOAuthDeadline),
			this.keyValueStorage.removeItem(authKeys.oauthPKCE),
			this.keyValueStorage.removeItem(authKeys.oauthState),
		]);
	}

	async clearOAuthData(): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);
		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);
		await this.clearOAuthInflightData();
		await this.keyValueStorage.removeItem(V5_HOSTED_UI_KEY); // remove in case a customer migrated an App from v5 to v6

		return this.keyValueStorage.removeItem(authKeys.oauthSignIn);
	}

	loadOAuthState(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		return this.keyValueStorage.getItem(authKeys.oauthState);
	}

	storeOAuthState(state: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		return this.keyValueStorage.setItem(authKeys.oauthState, state);
	}

	loadPKCE(): Promise<string | null> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		return this.keyValueStorage.getItem(authKeys.oauthPKCE);
	}

	storePKCE(pkce: string): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		return this.keyValueStorage.setItem(authKeys.oauthPKCE, pkce);
	}

	setAuthConfig(authConfigParam: CognitoUserPoolConfig): void {
		this.cognitoConfig = authConfigParam;
	}

	async loadOAuthInFlight(): Promise<boolean> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		return (
			(await this.keyValueStorage.getItem(authKeys.inflightOAuth)) === 'true'
		);
	}

	async loadOAuthInFlightDeadline(): Promise<number | undefined> {
		assertTokenProviderConfig(this.cognitoConfig);
		const { userPoolClientId } = this.cognitoConfig;

		if (!(await this.loadOAuthInFlight())) {
			return undefined;
		}

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			userPoolClientId,
		);

		const storedDeadline = await this.keyValueStorage.getItem(
			authKeys.inflightOAuthDeadline,
		);
		let deadline = Number(storedDeadline);

		if (storedDeadline === null || Number.isNaN(deadline)) {
			// Legacy writer (an older library version set the flag without a
			// deadline). Persist a default deadline counted from first observation
			// so it stays stable across tabs and page reloads instead of resetting
			// on every load. This write is purely additive — the legacy flow's own
			// state (inflight flag, PKCE, state) is never touched, and legacy
			// readers ignore the extra key. Concurrent first-observers may race
			// this write (last writer wins); the resulting drift is a few
			// milliseconds and harmless.
			deadline = Date.now() + OAUTH_INFLIGHT_TTL_MS;
			await this.keyValueStorage.setItem(
				authKeys.inflightOAuthDeadline,
				String(deadline),
			);
		}

		// An expired deadline makes the flag inert for BLOCKING purposes only; it
		// is evaluated at read time, never enforced by deleting the flow state
		// (only the flow-owner tab mutates it), so a slow login can still finish.
		return deadline > Date.now() ? deadline : undefined;
	}

	async storeOAuthInFlight(inflight: boolean): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);
		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		if (inflight) {
			// Write the deadline BEFORE the flag: a reader racing the two storage
			// writes must never observe the flag without its deadline, or it would
			// misclassify this writer as a legacy one and persist its own default.
			await this.keyValueStorage.setItem(
				authKeys.inflightOAuthDeadline,
				String(Date.now() + OAUTH_INFLIGHT_TTL_MS),
			);
		} else {
			await this.keyValueStorage.removeItem(authKeys.inflightOAuthDeadline);
		}

		await this.keyValueStorage.setItem(authKeys.inflightOAuth, `${inflight}`);
	}

	async loadOAuthSignIn(): Promise<{
		isOAuthSignIn: boolean;
		preferPrivateSession: boolean;
	}> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		const isLegacyHostedUISignIn =
			await this.keyValueStorage.getItem(V5_HOSTED_UI_KEY);

		const [isOAuthSignIn, preferPrivateSession] =
			(await this.keyValueStorage.getItem(authKeys.oauthSignIn))?.split(',') ??
			[];

		return {
			isOAuthSignIn:
				isOAuthSignIn === 'true' || isLegacyHostedUISignIn === 'true',
			preferPrivateSession: preferPrivateSession === 'true',
		};
	}

	async storeOAuthSignIn(
		oauthSignIn: boolean,
		preferPrivateSession = false,
	): Promise<void> {
		assertTokenProviderConfig(this.cognitoConfig);

		const authKeys = createKeysForAuthStorage(
			AUTH_KEY_PREFIX,
			this.cognitoConfig.userPoolClientId,
		);

		await this.keyValueStorage.setItem(
			authKeys.oauthSignIn,
			`${oauthSignIn},${preferPrivateSession}`,
		);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(OAuthStorageKeys)(provider, identifier);
};
