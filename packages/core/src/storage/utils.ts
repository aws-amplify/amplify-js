// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';

import { InMemoryStorage } from './InMemoryStorage';

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */

const logger = new ConsoleLogger('CoreStorageUtils');

export const getLocalStorageWithFallback = (): Storage => {
	try {
		// Attempt to use localStorage directly
		if (typeof window !== 'undefined' && window.localStorage) {
			return window.localStorage;
		}
	} catch (e) {
		// Handle any errors related to localStorage access
		logger.info(
			'localStorage not found. InMemoryStorage is used as a fallback.',
		);
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
			// Verify we can actually use it by testing access
			window.sessionStorage.getItem('test');

			return window.sessionStorage;
		}

		throw new Error('sessionStorage is not defined');
	} catch (e) {
		// Handle any errors related to sessionStorage access
		logger.info(
			'sessionStorage not found. InMemoryStorage is used as a fallback.',
		);

		return new InMemoryStorage();
	}
};
