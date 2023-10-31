// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	ConsoleLogger,
	Identity,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { assertIdentityPoolIdConfig } from '@aws-amplify/core/internals/utils';
import { IdentityIdStorageKeys, IdentityIdStore } from './types';
import { getAuthStorageKeys } from '../tokenProvider/TokenStore';
import { AuthKeys } from '../tokenProvider/types';

const logger = new ConsoleLogger('DefaultIdentityIdStore');

export class DefaultIdentityIdStore implements IdentityIdStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig?: AuthConfig;

	// Used as in-memory storage
	_primaryIdentityId: string | undefined;
	_authKeys: AuthKeys<string> = {};
	setAuthConfig(authConfigParam: AuthConfig) {
		assertIdentityPoolIdConfig(authConfigParam.Cognito);
		this.authConfig = authConfigParam;
		this._authKeys = createKeysForAuthStorage(
			'Cognito',
			authConfigParam.Cognito.identityPoolId
		);
		return;
	}

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}

	async loadIdentityId(): Promise<Identity | null> {
		assertIdentityPoolIdConfig(this.authConfig?.Cognito);
		try {
			if (!!this._primaryIdentityId) {
				return {
					id: this._primaryIdentityId,
					type: 'primary',
				};
			} else {
				const storedIdentityId = await this.keyValueStorage.getItem(
					this._authKeys.identityId
				);
				if (!!storedIdentityId) {
					return {
						id: storedIdentityId,
						type: 'guest',
					};
				}
				return null;
			}
		} catch (err) {
			logger.log('Error getting stored IdentityId.', err);
			return null;
		}
	}

	async storeIdentityId(identity: Identity): Promise<void> {
		assertIdentityPoolIdConfig(this.authConfig?.Cognito);

		if (identity.type === 'guest') {
			this.keyValueStorage.setItem(this._authKeys.identityId, identity.id);
			// Clear in-memory storage of primary identityId
			this._primaryIdentityId = undefined;
		} else {
			this._primaryIdentityId = identity.id;
			// Clear locally stored guest id
			this.keyValueStorage.removeItem(this._authKeys.identityId);
		}
	}

	async clearIdentityId(): Promise<void> {
		this._primaryIdentityId = undefined;
		await this.keyValueStorage.removeItem(this._authKeys.identityId);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(IdentityIdStorageKeys)(
		`com.amplify.${provider}`,
		identifier
	);
};
