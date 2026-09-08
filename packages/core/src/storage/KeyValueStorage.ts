// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '../errors';
import { KeyValueStorageEvent, KeyValueStorageInterface } from '../types';
import { isBrowser } from '../utils';

/**
 * @internal
 */
export class KeyValueStorage implements KeyValueStorageInterface {
	storage?: Storage;
	listeners?: Set<(e: KeyValueStorageEvent) => void>;

	/**
	 * The bound `window` 'storage' event handler. It is created lazily on the
	 * first successful browser subscription and cleared once the last listener
	 * unsubscribes. Instances that never subscribe therefore carry no
	 * function-valued own property, which keeps two structurally-identical
	 * storage instances deep-equal for consumers that compare by value (e.g.
	 * Jest's `toHaveBeenCalledWith`).
	 */
	private storageListener?: (event: StorageEvent) => void;

	constructor(storage?: Storage) {
		this.storage = storage;
	}

	/**
	 * This is used to set a specific item in storage
	 * @param {string} key - the key for the item
	 * @param {object} value - the value
	 * @returns {string} value that was set
	 */
	async setItem(key: string, value: string) {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.setItem(key, value);
	}

	/**
	 * This is used to get a specific key from storage
	 * @param {string} key - the key for the item
	 * This is used to clear the storage
	 * @returns {string} the data item
	 */
	async getItem(key: string) {
		if (!this.storage) throw new PlatformNotSupportedError();

		return this.storage.getItem(key);
	}

	/**
	 * This is used to remove an item from storage
	 * @param {string} key - the key being set
	 * @returns {string} value - value that was deleted
	 */
	async removeItem(key: string) {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.removeItem(key);
	}

	/**
	 * This is used to clear the storage
	 * @returns {string} nothing
	 */
	async clear() {
		if (!this.storage) throw new PlatformNotSupportedError();
		this.storage.clear();
	}

	/**
	 * This is used to allow listening for changes
	 * @param {function} listener - the function called on storage change
	 * @returns {function} an unsubscribe function that removes the listener. The
	 * underlying `window` 'storage' event listener is attached lazily on the
	 * first subscription and detached once the last listener unsubscribes. In
	 * non-browser (SSR/native) environments nothing is attached and the returned
	 * unsubscribe function is a safe no-op.
	 */
	addListener(
		listener: (ev: KeyValueStorageEvent) => Promise<void>,
	): () => void {
		const listeners = (this.listeners ??= new Set());
		listeners.add(listener);

		// Lazily attach the cross-tab 'storage' listener on the first subscription.
		if (isBrowser() && listeners.size === 1) {
			// Create the handler lazily (and only in a browser) so instances that
			// never subscribe keep no function-valued own property. The same
			// reference is reused for detach on last-unsubscribe.
			const storageListener = (e: StorageEvent) => {
				this.listeners?.forEach(l => {
					l({
						key: e.key,
						oldValue: e.oldValue,
						newValue: e.newValue,
					});
				});
			};
			this.storageListener = storageListener;
			window.addEventListener('storage', storageListener, false);
		}

		return () => {
			listeners.delete(listener);
			const { storageListener } = this;
			// Detach once the last subscriber unsubscribes — real teardown, not
			// just pruning the set. Guarding on the stored handler keeps repeated
			// unsubscribe calls idempotent.
			if (isBrowser() && listeners.size === 0 && storageListener) {
				window.removeEventListener('storage', storageListener, false);
				this.storageListener = undefined;
			}
		};
	}
}
