// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
export const getLocalStorageWithFallback = (): Storage => {
	try {
		// Attempt to use localStorage directly
		if (typeof window !== 'undefined' && window.localStorage) {
			return window.localStorage;
		}
	} catch (e) {
		// Handle any errors related to localStorage access
		console.error('LocalStorage access failed:', e);
	}

	// Return in-memory storage as a fallback if localStorage is not accessible
	return new InMemoryStorage();
};

/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
export const getSessionStorageWithFallback = (): Storage => {
	try {
		// Attempt to use sessionStorage directly
		if (typeof window !== 'undefined' && window.sessionStorage) {
			return window.sessionStorage;
		}
	} catch (e) {
		// Handle any errors related to sessionStorage access
		console.error('SessionStorage access failed:', e);
	}

	// Return in-memory storage as a fallback if sessionStorage is not accessible
	return new InMemoryStorage();
};
