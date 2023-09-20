// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 */
export class InMemoryStorage implements Storage {
	storage = new Map<string, string>();

	get length() {
		return this.storage.size;
	}

	key(index: number) {
		if (index > this.length - 1) {
			return null;
		}
		return Array.from(this.storage.keys())[index];
	}

	setItem(key: string, value: string) {
		this.storage.set(key, value);
	}

	getItem(key: string) {
		return this.storage.get(key) ?? null;
	}

	removeItem(key: string) {
		this.storage.delete(key);
	}

	clear() {
		this.storage.clear();
	}
}
