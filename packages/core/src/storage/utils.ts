// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';

/**
 * Checks if Web Storage (localStorage or sessionStorage) is available.
 *
 * Based on MDN documentation:
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability
 */
const storageAvailable = (type: 'localStorage' | 'sessionStorage') => {
	let storage;

	try {
		storage = window[type];
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);

		return true;
	} catch (e) {
		console.log(e);

		return (
			e instanceof DOMException &&
			e.name === 'QuotaExceededError' &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage &&
			storage.length !== 0
		);
	}
};

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
export const getLocalStorageWithFallback = (): Storage =>
	storageAvailable('localStorage')
		? window.localStorage
		: new InMemoryStorage();

/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
export const getSessionStorageWithFallback = (): Storage =>
	storageAvailable('sessionStorage')
		? window.sessionStorage
		: new InMemoryStorage();
