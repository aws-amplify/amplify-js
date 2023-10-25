// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '@aws-amplify/core';
import { CookieStorage } from '@aws-amplify/core/internals/adapter-core';

export const defaultSetCookieOptions: CookieStorage.SetCookieOptions = {
	// TODO: allow configure with a public interface
	sameSite: 'lax',
};
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Creates a Key Value storage interface using the `cookieStorageAdapter` as the
 * underlying storage.
 * @param cookieStorageAdapter An implementation of the `Adapter` in {@link CookieStorage}.
 * @returns An object that implements {@link KeyValueStorageInterface}.
 */
export const createKeyValueStorageFromCookieStorageAdapter = (
	cookieStorageAdapter: CookieStorage.Adapter
): KeyValueStorageInterface => {
	return {
		setItem(key, value) {
			// TODO(HuiSF): follow up the default CookieSerializeOptions values
			cookieStorageAdapter.set(key, value, {
				...defaultSetCookieOptions,
				expires: new Date(Date.now() + ONE_YEAR_IN_MS),
			});
			return Promise.resolve();
		},
		getItem(key) {
			const cookie = cookieStorageAdapter.get(key);
			return Promise.resolve(cookie?.value ?? null);
		},
		removeItem(key) {
			cookieStorageAdapter.delete(key);
			return Promise.resolve();
		},
		clear() {
			// TODO(HuiSF): follow up the implementation.
			throw new Error('This method has not implemented.');
		},
	};
};
