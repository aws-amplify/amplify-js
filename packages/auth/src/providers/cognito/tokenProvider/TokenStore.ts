// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthConfig, KeyValueStorageInterface } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	asserts,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';
import {
	AuthKeys,
	AuthTokenStorageKeys,
	AuthTokenStore,
	CognitoAuthTokens,
} from './types';
import { AuthError } from '../../../errors/AuthError';

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
		return;
	}
	setAuthConfig(authConfig: AuthConfig) {
		this.authConfig = authConfig;
	}

	async loadTokens(): Promise<CognitoAuthTokens | null> {
		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format

		// Reading V6 tokens
		assertTokenProviderConfig(this.authConfig?.Cognito);
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.Cognito.userPoolClientId
			);

			const accessTokenString = await this.getKeyValueStorage().getItem(
				authKeys.accessToken
			);

			if (!accessTokenString) {
				throw new Error('No session');
			}

			const accessToken = decodeJWT(accessTokenString);
			const itString = await this.getKeyValueStorage().getItem(
				authKeys.idToken
			);
			const idToken = itString ? decodeJWT(itString) : undefined;

			const refreshToken =
				(await this.getKeyValueStorage().getItem(authKeys.refreshToken)) ||
				undefined;

			const deviceMetadata = JSON.parse(
				(await this.getKeyValueStorage().getItem(authKeys.NewDeviceMetadata)) ||
					'{}'
			);
			const NewDeviceMetadata =
				Object.keys(deviceMetadata).length > 0 ? deviceMetadata : undefined;

			const clockDriftString =
				(await this.getKeyValueStorage().getItem(authKeys.clockDrift)) || '0';
			const clockDrift = Number.parseInt(clockDriftString);

			return {
				accessToken,
				idToken,
				refreshToken,
				NewDeviceMetadata,
				clockDrift,
			};
		} catch (err) {
			return null;
		}
	}
	async storeTokens(tokens: CognitoAuthTokens): Promise<void> {
		asserts(!(tokens === undefined), {
			message: 'Invalid tokens',
			name: 'InvalidAuthTokens',
			recoverySuggestion: 'Make sure the tokens are valid',
		});
		assertTokenProviderConfig(this.authConfig?.Cognito);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.Cognito.userPoolClientId
		);

		this.getKeyValueStorage().setItem(
			authKeys.accessToken,
			tokens.accessToken.toString()
		);

		if (!!tokens.idToken) {
			this.getKeyValueStorage().setItem(
				authKeys.idToken,
				tokens.idToken.toString()
			);
		}

		if (!!tokens.refreshToken) {
			this.getKeyValueStorage().setItem(
				authKeys.refreshToken,
				tokens.refreshToken
			);
		}

		if (!!tokens.NewDeviceMetadata) {
			this.getKeyValueStorage().setItem(
				authKeys.NewDeviceMetadata,
				JSON.stringify(tokens.NewDeviceMetadata)
			);
		}

		this.getKeyValueStorage().setItem(
			authKeys.clockDrift,
			`${tokens.clockDrift}`
		);
	}

	async clearTokens(): Promise<void> {
		assertTokenProviderConfig(this.authConfig?.Cognito);
		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.Cognito.userPoolClientId
		);

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.getKeyValueStorage().removeItem(authKeys.accessToken),
			this.getKeyValueStorage().removeItem(authKeys.idToken),
			this.getKeyValueStorage().removeItem(authKeys.clockDrift),
			this.getKeyValueStorage().removeItem(authKeys.refreshToken),
		]);
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
