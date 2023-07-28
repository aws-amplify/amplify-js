// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	AuthKeys,
	AuthTokenStorageKeys,
	IdenityIdStore,
	Identity,
} from './types';
import { KeyValueStorageInterface } from '../../types';
import { asserts } from '../../Util/errors/AssertError';
import { MemoryKeyValueStorage } from '../../StorageHelper';
import { assertIdentityIdProviderConfig } from './utils';

class DefaultIdentityIdStore implements IdenityIdStore {
	inMemoryStorage: KeyValueStorageInterface;
	localStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	constructor() {
		this.inMemoryStorage = new MemoryKeyValueStorage();

		// TODO(V6): Change this to take a local storage adapter
		this.localStorage = new MemoryKeyValueStorage();
	}

	async loadIdentityId(): Promise<Identity | undefined> {
		assertIdentityIdProviderConfig(this.authConfig);

		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format

		// Reading V6 tokens
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.identityPoolId
			);

			let identityId: string = await this.inMemoryStorage.getItem(
				authKeys.identityId
			);
			if (!!identityId) {
				return {
					id: identityId,
					type: 'guest',
				};
			} else {
				identityId = await this.localStorage.getItem(authKeys.identityId);
				if (!!identityId) {
					return {
						id: identityId,
						type: 'primary',
					};
				}
			}
		} catch (err) {
			// TODO(v6): validate partial results with mobile implementation
			throw new Error(`Error loading identityId from storage: ${err}`);
		}
	}
	async storeIdentityId(identity: Identity): Promise<void> {
		assertIdentityIdProviderConfig(this.authConfig);
		asserts(!(identity === undefined), {
			message: 'Invalid Identity',
			name: 'InvalidAuthIdentity',
			recoverySuggestion: 'Make sure identity is valid',
		});

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);
		if (identity.type === 'guest') {
			this.inMemoryStorage.setItem(authKeys.identityId, identity.id);
		} else {
			this.localStorage.setItem(authKeys.identityId, identity.id);
		}
	}

	async clearIdentityId(): Promise<void> {
		assertIdentityIdProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);

		// Not calling clear because it can remove data that is not managed by AuthTokenStore
		await Promise.all([
			this.inMemoryStorage.removeItem(authKeys.identityId),
			this.localStorage.removeItem(authKeys.identityId),
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

export const defaultIdentityIdStore = new DefaultIdentityIdStore();
