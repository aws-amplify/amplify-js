// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthConfig,
	ConsoleLogger,
	KeyValueStorageInterface,
} from '@aws-amplify/core';
import { assertIdentityPoolIdConfig } from '@aws-amplify/core/internals/utils';

import { getAuthStorageKeys } from '../tokenProvider/TokenStore';
import { AuthKeys } from '../tokenProvider/types';

import { IdentityIdStorageKeys, IdentityIdStore } from './types';

const logger = new ConsoleLogger('DefaultIdentityIdStore');

export class DefaultIdentityIdStore implements IdentityIdStore {
	keyValueStorage: KeyValueStorageInterface;
	authConfig?: AuthConfig;

	_authKeys: AuthKeys<string> = {};

	setAuthConfig(authConfigParam: AuthConfig) {
		assertIdentityPoolIdConfig(authConfigParam.Cognito);
		this.authConfig = authConfigParam;
		this._authKeys = createKeysForAuthStorage(
			'Cognito',
			authConfigParam.Cognito.identityPoolId,
		);
	}

	constructor(keyValueStorage: KeyValueStorageInterface) {
		this.keyValueStorage = keyValueStorage;
	}

	async loadIdentityId(): Promise<string | null> {
		assertIdentityPoolIdConfig(this.authConfig?.Cognito);
		try {
			const storedIdentityId = await this.keyValueStorage.getItem(
				this._authKeys.identityId,
			);
			if (storedIdentityId) {
				return storedIdentityId;
			}

			return null;
		} catch (err) {
			logger.log('Error getting stored IdentityId.', err);

			return null;
		}
	}

	async storeIdentityId(identity: string): Promise<void> {
		assertIdentityPoolIdConfig(this.authConfig?.Cognito);
		this.keyValueStorage.setItem(this._authKeys.identityId, identity);
	}

	async clearIdentityId(identityPoolId: string): Promise<void> {
		// fixed: we need to generate the authKeys in the case of tab/app refresh before calling this method.
		if (!this._authKeys.identityId) {
			logger.debug('No auth keys present, so generating it.');
			this._authKeys = createKeysForAuthStorage('Cognito', identityPoolId);
		}
		await this.keyValueStorage.removeItem(this._authKeys.identityId);
	}
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
	return getAuthStorageKeys(IdentityIdStorageKeys)(
		`com.amplify.${provider}`,
		identifier,
	);
};
