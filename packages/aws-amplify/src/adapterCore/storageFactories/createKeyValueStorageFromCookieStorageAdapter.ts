// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '@aws-amplify/core';
import { CookieStorage } from '@aws-amplify/core/internals/adapter-core';

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
			const originalCookie = cookieStorageAdapter.get(key) ?? {};
			cookieStorageAdapter.set(key, value, {
				...extractSerializeOptions(originalCookie),
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

const extractSerializeOptions = (
	cookie: Partial<CookieStorage.Cookie>
): CookieStorage.SetCookieOptions => ({
	domain: cookie.domain,
	expires: cookie.expires,
	httpOnly: cookie.httpOnly,
	maxAge: cookie.maxAge,
	sameSite: cookie.sameSite,
});
