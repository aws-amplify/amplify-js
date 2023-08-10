// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	Identity,
	KeyValueStorageInterface,
	assertIdentityPooIdConfig,
} from '@aws-amplify/core';
import { IdentityIdStorageKeys } from './types';
import { AuthError } from '../../../errors/AuthError';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';

export class DefaultIdentityIdStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig: AuthConfig;

	// Used as in-memory storage
	_primaryIdentityId: string | undefined;

	setAuthConfig(authConfigParam: AuthConfig) {
		this.authConfig = authConfigParam;
		return;
	}

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
		return;
	}

	async loadIdentityId(): Promise<Identity | undefined> {
		assertIdentityPooIdConfig(this.authConfig);
		if (this.keyValueStorage === undefined) {
			throw new AuthError({
				message: 'No KeyValueStorage available',
				name: 'KeyValueStorageNotFound',
				recoverySuggestion:
					'Make sure to set the keyValueStorage before using this method',
			});
		}
		// TODO(v6): migration logic should be here
		// Reading V5 tokens old format
		try {
			const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
			const authKeys = createKeysForAuthStorage(
				name,
				this.authConfig.identityPoolId
			);

			if (!!this._primaryIdentityId) {
				return {
					id: this._primaryIdentityId,
					type: 'primary',
				};
			} else {
				const storedIdentityId = await this.keyValueStorage.getItem(
					authKeys.identityId
				);
				if (!!storedIdentityId) {
					return {
						id: storedIdentityId,
						type: 'guest',
					};
				}
			}
		} catch (err) {
			// TODO(v6): validate partial results with mobile implementation
			throw new Error(`Error loading identityId from storage: ${err}`);
		}
	}

	async storeIdentityId(identity: Identity): Promise<void> {
		assertIdentityPooIdConfig(this.authConfig);
		if (identity === undefined) {
			throw new AuthError({
				message: 'Invalid Identity parameter',
				name: 'InvalidAuthIdentity',
				recoverySuggestion: 'Make sure a valid Identity object is passed',
			});
		}
		if (this.keyValueStorage === undefined) {
			throw new AuthError({
				message: 'No KeyValueStorage available',
				name: 'KeyValueStorageNotFound',
				recoverySuggestion:
					'Make sure to set the keyValueStorage before using this method',
			});
		}

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);
		if (identity.type === 'guest') {
			this.keyValueStorage.setItem(authKeys.identityId, identity.id);
			// Clear in-memory storage of primary identityId
			this._primaryIdentityId = undefined;
		} else {
			this._primaryIdentityId = identity.id;
			// Clear locally stored guest id
			this.keyValueStorage.clear();
		}
	}

	async clearIdentityId(): Promise<void> {
		assertIdentityPooIdConfig(this.authConfig);

		const name = 'Cognito'; // TODO(v6): update after API review for Amplify.configure
		const authKeys = createKeysForAuthStorage(
			name,
			this.authConfig.identityPoolId
		);

		this._primaryIdentityId = undefined;
		await Promise.all([this.keyValueStorage.removeItem(authKeys.identityId)]);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(IdentityIdStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
};
