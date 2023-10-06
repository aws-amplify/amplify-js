// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthConfig, KeyValueStorageInterface } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';
import {
	AuthKeys,
	AuthTokenStorageKeys,
	AuthTokenStore,
	CognitoAuthTokens,
	DeviceMetadata,
} from './types';
import { AuthError } from '../../../errors/AuthError';
import { assert, TokenProviderErrorCode } from './errorHelpers';

export class DefaultTokenStore implements AuthTokenStore {
	private authConfig?: AuthConfig;
	keyValueStorage?: KeyValueStorageInterface;
	private name = 'CognitoIdentityServiceProvider'; // To be backwards compatible with V5, no migration needed
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
				authKeys.accessToken
			);

			if (!accessTokenString) {
				throw new AuthError({
					name: 'NoSessionFoundException',
					message: 'Auth session was not found. Make sure to call signIn.',
				});
			}

			const accessToken = decodeJWT(accessTokenString);
			const itString = await this.getKeyValueStorage().getItem(
				authKeys.idToken
			);
			const idToken = itString ? decodeJWT(itString) : undefined;

			const refreshToken =
				(await this.getKeyValueStorage().getItem(authKeys.refreshToken)) ??
				undefined;

			const clockDriftString =
				(await this.getKeyValueStorage().getItem(authKeys.clockDrift)) ?? '0';
			const clockDrift = Number.parseInt(clockDriftString);

			return {
				accessToken,
				idToken,
				refreshToken,
				deviceMetadata: (await this.getDeviceMetadata()) ?? undefined,
				clockDrift,
				username: decodeURIComponent(await this.getLastAuthUser()),
			};
		} catch (err) {
			return null;
		}
	}
	async storeTokens(tokens: CognitoAuthTokens): Promise<void> {
		assert(tokens !== undefined, TokenProviderErrorCode.InvalidAuthTokens);
		await this.clearTokens();

		const lastAuthUser =
			(tokens.username && encodeURIComponent(tokens.username)) ?? 'username';
		await this.getKeyValueStorage().setItem(
			this.getLastAuthUserKey(),
			lastAuthUser
		);
		const authKeys = await this.getAuthKeys();
		await this.getKeyValueStorage().setItem(
			authKeys.accessToken,
			tokens.accessToken.toString()
		);

		if (!!tokens.idToken) {
			await this.getKeyValueStorage().setItem(
				authKeys.idToken,
				tokens.idToken.toString()
			);
		}

		if (!!tokens.refreshToken) {
			await this.getKeyValueStorage().setItem(
				authKeys.refreshToken,
				tokens.refreshToken
			);
		}

		if (!!tokens.deviceMetadata) {
			if (tokens.deviceMetadata.deviceKey) {
				await this.getKeyValueStorage().setItem(
					authKeys.deviceKey,
					tokens.deviceMetadata.deviceKey
				);
			}
			if (tokens.deviceMetadata.deviceGroupKey) {
				await this.getKeyValueStorage().setItem(
					authKeys.deviceGroupKey,
					tokens.deviceMetadata.deviceGroupKey
				);
			}

			await this.getKeyValueStorage().setItem(
				authKeys.randomPasswordKey,
				tokens.deviceMetadata.randomPassword
			);
		}

		await this.getKeyValueStorage().setItem(
			authKeys.clockDrift,
			`${tokens.clockDrift}`
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
			this.getKeyValueStorage().removeItem(this.getLastAuthUserKey()),
		]);
	}

	async getDeviceMetadata(username?: string): Promise<DeviceMetadata | null> {
		const authKeys = await this.getDeviceAuthKeys(username);
		const deviceKey = await this.getKeyValueStorage().getItem(
			authKeys.deviceKey
		);
		const deviceGroupKey = await this.getKeyValueStorage().getItem(
			authKeys.deviceGroupKey
		);
		const randomPassword = await this.getKeyValueStorage().getItem(
			authKeys.randomPasswordKey
		);

		return !!randomPassword
			? {
					deviceKey: deviceKey ?? undefined,
					deviceGroupKey: deviceGroupKey ?? undefined,
					randomPassword,
			  }
			: null;
	}
	async clearDeviceMetadata(username?: string): Promise<void> {
		const authKeys = await this.getDeviceAuthKeys(username);
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.deviceKey),
			this.getKeyValueStorage().removeItem(authKeys.deviceGroupKey),
			this.getKeyValueStorage().removeItem(authKeys.randomPasswordKey),
		]);
	}

	private async getAuthKeys(
		username?: string
	): Promise<AuthKeys<keyof typeof AuthTokenStorageKeys>> {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const lastAuthUser = username ?? (await this.getLastAuthUser());
		return createKeysForAuthStorage(
			this.name,
			`${this.authConfig.Cognito.userPoolClientId}.${lastAuthUser}`
		);
	}
	private async getDeviceAuthKeys(
		username?: string
	): Promise<AuthKeys<keyof typeof AuthTokenStorageKeys>> {
		let authKeys: AuthKeys<keyof typeof AuthTokenStorageKeys>;
		if (username) {
			const authEncodedKeys = await this.getAuthKeys(
				encodeURIComponent(username)
			);
			const authNonEncodedKeys = await this.getAuthKeys(username);
			const isEncodedKeysPresent = !!(await this.getKeyValueStorage().getItem(
				authEncodedKeys.randomPasswordKey
			));
			authKeys = isEncodedKeysPresent ? authEncodedKeys : authNonEncodedKeys;
		} else {
			authKeys = await this.getAuthKeys();
		}
		return authKeys;
	}

	private getLastAuthUserKey() {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const identifier = this.authConfig.Cognito.userPoolClientId;
		return `${this.name}.${identifier}.LastAuthUser`;
	}

	private async getLastAuthUser(): Promise<string> {
		const lastAuthUser =
			(await this.getKeyValueStorage().getItem(this.getLastAuthUserKey())) ??
			'username';

		return lastAuthUser;
	}
}

export const createKeysForAuthStorage = (
	provider: string,
	identifier: string
) => {
	return getAuthStorageKeys(AuthTokenStorageKeys)(`${provider}`, identifier);
};

export function getAuthStorageKeys<T extends Record<string, string>>(
	authKeys: T
) {
	const keys = Object.values({ ...authKeys });
	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, authKey) => ({
				...acc,
				[authKey]: `${prefix}.${identifier}.${authKey}`,
			}),
			{} as AuthKeys<keyof T & string>
		);
}
