// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '../utils';

import { KeyValueStorage } from './KeyValueStorage';
import { getLocalStorageWithFallback } from './utils';

/**
 * @internal
 */
export class DefaultStorage extends KeyValueStorage {
	constructor() {
		super(getLocalStorageWithFallback());
		this.storageListener = this.storageListener.bind(this);

		if (isBrowser()) {
			window.addEventListener('storage', this.storageListener, false);
			this.listeners = new Set();
		}
	}

	private storageListener = (e: StorageEvent) => {
		this.listeners?.forEach(listener => {
			listener({
				key: e.key,
				oldValue: e.oldValue,
				newValue: e.newValue,
			});
		});
	};
}
