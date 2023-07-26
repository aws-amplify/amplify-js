// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertCredentialsProviderConfig, decodeJWT } from '.';
import {
	AuthConfig,
	AuthCredentialStore,
	AuthKeys,
	AuthStorageKeys,
} from './types';
import { KeyValueStorageInterface } from '../../types';
import { asserts } from '../../Util/errors/AssertError';
import { Credentials } from '@aws-sdk/types';

export class DefaultCredentialStore implements AuthCredentialStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadCredentials(): Promise<
		(Credentials & { isAuthenticatedCreds: boolean }) | undefined
	> {
		assertCredentialsProviderConfig(this.authConfig);

		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format

		// Reading V6 tokens
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.identityPoolId
			);

			const accessKeyId = await this.keyValueStorage.getItem(
				authKeys.accessKeyId
			);
			const secretAccessKey = await this.keyValueStorage.getItem(
				authKeys.secretAccessKey
			);
			const sessionToken = await this.keyValueStorage.getItem(
				authKeys.sessionToken
			);

			const storedExpiration = await this.keyValueStorage.getItem(
				authKeys.expiration
			);

			const expiration = !!storedExpiration
				? new Date(Number.parseInt(storedExpiration) * 1000)
				: undefined;

			const isAuthenticatedCreds =
				(await this.keyValueStorage.getItem(authKeys.isAuthenticatedCreds)) ===
				'true';
			if (accessKeyId && secretAccessKey) {
				return {
					accessKeyId,
					secretAccessKey,
					sessionToken,
					expiration,
					isAuthenticatedCreds,
				};
			}
		} catch (err) {
			// TODO(v6): validate partial results with mobile implementation
			throw new Error('No valid credentials');
		}
	}
	async storeCredentials(
		credentials: Credentials & { isAuthenticatedCreds: boolean }
	): Promise<void> {
		assertCredentialsProviderConfig(this.authConfig);
		asserts(!(credentials === undefined), {
			message: 'Invalid credentials',
			name: 'InvalidAuthcredentials',
			recoverySuggestion: 'Make sure the credentials are valid',
		});

		console.log('Storing creds: ', credentials);
		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);

		this.keyValueStorage.setItem(
			authKeys.accessKeyId,
			credentials.accessKeyId.toString()
		);

		this.keyValueStorage.setItem(
			authKeys.secretAccessKey,
			credentials.secretAccessKey.toString()
		);

		if (!!credentials.sessionToken) {
			this.keyValueStorage.setItem(
				authKeys.sessionToken,
				credentials.sessionToken.toString()
			);
		}

		if (!!credentials.expiration) {
			this.keyValueStorage.setItem(
				authKeys.expiration,
				`${credentials.expiration}`
			);
		}
		this.keyValueStorage.setItem(
			authKeys.isAuthenticatedCreds,
			`${credentials.isAuthenticatedCreds}`
		);
	}

	async clearCredentials(): Promise<void> {
		assertCredentialsProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.keyValueStorage.removeItem(authKeys.accessKeyId),
			this.keyValueStorage.removeItem(authKeys.secretAccessKey),
			this.keyValueStorage.removeItem(authKeys.sessionToken),
			this.keyValueStorage.removeItem(authKeys.expiration),
		]);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(AuthStorageKeys)(
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
