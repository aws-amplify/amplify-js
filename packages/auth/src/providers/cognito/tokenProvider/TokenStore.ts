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
	private name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure

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
			const accessTokenString = await this.getKeyValueStorage().getItem(
				this.getAuthKeys().accessToken
			);

			if (!accessTokenString) {
				throw new AuthError({
					name: 'NoSessionFoundException',
					message: 'Auth session was not found. Make sure to call signIn.',
				});
			}

			const accessToken = decodeJWT(accessTokenString);
			const itString = await this.getKeyValueStorage().getItem(
				this.getAuthKeys().idToken
			);
			const idToken = itString ? decodeJWT(itString) : undefined;

			const refreshToken =
				(await this.getKeyValueStorage().getItem(
					this.getAuthKeys().refreshToken
				)) || undefined;

			const clockDriftString =
				(await this.getKeyValueStorage().getItem(
					this.getAuthKeys().clockDrift
				)) || '0';
			const clockDrift = Number.parseInt(clockDriftString);

			return {
				accessToken,
				idToken,
				refreshToken,
				deviceMetadata: (await this.getDeviceMetadata()) ?? undefined,
				clockDrift,
			};
		} catch (err) {
			return null;
		}
	}
	async storeTokens(tokens: CognitoAuthTokens): Promise<void> {
		assert(tokens !== undefined, TokenProviderErrorCode.InvalidAuthTokens);

		this.getKeyValueStorage().setItem(
			this.getAuthKeys().accessToken,
			tokens.accessToken.toString()
		);

		if (!!tokens.idToken) {
			this.getKeyValueStorage().setItem(
				this.getAuthKeys().idToken,
				tokens.idToken.toString()
			);
		}

		if (!!tokens.refreshToken) {
			this.getKeyValueStorage().setItem(
				this.getAuthKeys().refreshToken,
				tokens.refreshToken
			);
		}

		if (!!tokens.deviceMetadata) {
			this.getKeyValueStorage().setItem(
				this.getAuthKeys().deviceMetadata,
				JSON.stringify(tokens.deviceMetadata)
			);
		}

		this.getKeyValueStorage().setItem(
			this.getAuthKeys().clockDrift,
			`${tokens.clockDrift}`
		);
	}

	async clearTokens(): Promise<void> {
		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.getKeyValueStorage().removeItem(this.getAuthKeys().accessToken),
			this.getKeyValueStorage().removeItem(this.getAuthKeys().idToken),
			this.getKeyValueStorage().removeItem(this.getAuthKeys().clockDrift),
			this.getKeyValueStorage().removeItem(this.getAuthKeys().refreshToken),
		]);
	}

	async getDeviceMetadata(): Promise<DeviceMetadata | null> {
		const newDeviceMetadata = JSON.parse(
			(await this.getKeyValueStorage().getItem(
				this.getAuthKeys().deviceMetadata
			)) || '{}'
		);
		const deviceMetadata =
			Object.keys(newDeviceMetadata).length > 0 ? newDeviceMetadata : null;
		return deviceMetadata;
	}
	async clearDeviceMetadata(): Promise<void> {
		await this.getKeyValueStorage().removeItem(
			this.getAuthKeys().deviceMetadata
		);
	}

	private getAuthKeys(): AuthKeys<keyof typeof AuthTokenStorageKeys> {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const authKeys = createKeysForAuthStorage(
			this.name,
			this.authConfig.Cognito.userPoolClientId
		);
		return authKeys;
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(AuthTokenStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
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
