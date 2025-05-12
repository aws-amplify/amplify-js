// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '@aws-amplify/core';
import {
	CookieStorage,
	KeyValueStorageMethodValidator,
} from '@aws-amplify/core/internals/adapter-core';

import { DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE } from '../constants';

export const defaultSetCookieOptions: CookieStorage.SetCookieOptions = {
	// TODO: allow configure with a public interface
	sameSite: 'lax',
	secure: true,
	path: '/',
};

/**
 * Creates a Key Value storage interface using the `cookieStorageAdapter` as the
 * underlying storage.
 * @param cookieStorageAdapter An implementation of the `Adapter` in {@link CookieStorage}.
 * @returns An object that implements {@link KeyValueStorageInterface}.
 */
export const createKeyValueStorageFromCookieStorageAdapter = (
	cookieStorageAdapter: CookieStorage.Adapter,
	validator?: KeyValueStorageMethodValidator,
	setCookieOptions: CookieStorage.SetCookieOptions = {},
): KeyValueStorageInterface => {
	return {
		setItem(key, value) {
			// Delete the cookie item first then set it. This results:
			// SetCookie: key=;expires=1970-01-01;(path='current-path') <- remove path'ed cookies
			// SetCookie: key=value;expires=Date.now() + 365 days;path=/;secure=true
			cookieStorageAdapter.delete(key);

			const mergedCookieOptions = {
				...defaultSetCookieOptions,
				...setCookieOptions,
			};

			// when expires and maxAge both are not specified, we set a default maxAge
			if (!mergedCookieOptions.expires && !mergedCookieOptions.maxAge) {
				mergedCookieOptions.maxAge = DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE;
			}

			cookieStorageAdapter.set(key, value, mergedCookieOptions);

			return Promise.resolve();
		},
		async getItem(key) {
			const cookie = cookieStorageAdapter.get(key);
			const value = cookie?.value ?? null;

			if (value && validator?.getItem) {
				const isValid = await validator.getItem(key, value);
				if (!isValid) return null;
			}

			return value;
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
