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
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	// Used as in-memory storage
	_identityId: string | undefined;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadIdentityId(): Promise<Identity | undefined> {
		assertIdentityIdProviderConfig(this.authConfig);

		asserts(!(this.keyValueStorage === undefined), {
			message: 'No KeyValueStorage available',
			name: 'KeyValueStorageNotFound',
			recoverySuggestion:
				'Make sure to set the keyValueStorage before using this method',
		});
		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.identityPoolId
			);

			if (!!this._identityId) {
				return {
					id: this._identityId,
					type: 'guest',
				};
			} else {
				const storedIdentityId = await this.keyValueStorage.getItem(
					authKeys.identityId
				);
				if (!!storedIdentityId) {
					return {
						id: storedIdentityId,
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
			message: 'Invalid Identity parameter',
			name: 'InvalidAuthIdentity',
			recoverySuggestion: 'Make sure a valid Identity object is passed',
		});
		asserts(!(this.keyValueStorage === undefined), {
			message: 'No KeyValueStorage available',
			name: 'KeyValueStorageNotFound',
			recoverySuggestion:
				'Make sure to set the keyValueStorage before using this method',
		});

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);
		if (identity.type === 'guest') {
			this._identityId = identity.id;
		} else {
			this.keyValueStorage.setItem(authKeys.identityId, identity.id);
		}
	}

	async clearIdentityId(): Promise<void> {
		assertIdentityIdProviderConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);

		this._identityId = undefined;
		await Promise.all([this.keyValueStorage.removeItem(authKeys.identityId)]);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(AuthTokenStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
};

function getAuthStorageKeys<T extends Record<string, string>>(authKeys: T) {
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
