// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';

const TEST_KEY = 'aws.amplify.test-ls';

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
export const getDefaultStorageWithFallback = (): Storage => {
	try {
		window.localStorage.setItem(TEST_KEY, '');
		window.localStorage.removeItem(TEST_KEY);
		return window.localStorage;
	} catch (_) {
		return new InMemoryStorage();
	}
};

/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
export const getSessionStorageWithFallback = (): Storage => {
	try {
		window.sessionStorage.setItem(TEST_KEY, '');
		window.sessionStorage.removeItem(TEST_KEY);
		return window.sessionStorage;
	} catch (_) {
		return new InMemoryStorage();
	}
};
