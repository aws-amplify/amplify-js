// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';

const cachedMemoryStorageInstances: Record<
	'local' | 'session',
	InMemoryStorage
> = {
	local: new InMemoryStorage(),
	session: new InMemoryStorage(),
};

/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
export const getLocalStorageWithFallback = (): Storage =>
	typeof window !== 'undefined' && window.localStorage
		? window.localStorage
		: getSessionMemoryStorage('local');

/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
export const getSessionStorageWithFallback = (): Storage =>
	typeof window !== 'undefined' && window.sessionStorage
		? window.sessionStorage
		: getSessionMemoryStorage('session');

const getSessionMemoryStorage = (key: 'local' | 'session') => {
	if (!cachedMemoryStorageInstances[key]) {
		cachedMemoryStorageInstances[key] = new InMemoryStorage();
	}

	return cachedMemoryStorageInstances[key];
};
