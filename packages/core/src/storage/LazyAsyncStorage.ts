// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';

type AsyncStorage = ReturnType<typeof loadAsyncStorage>;

/**
 * Loads AsyncStorage on first use instead of on import, so apps that never
 * touch the default storage or Cache can run without it linked. Methods are
 * async so a missing module rejects instead of throwing synchronously.
 *
 * @internal
 */
export class LazyAsyncStorage {
	private asyncStorage?: AsyncStorage;

	private load(): AsyncStorage {
		// A failed load is not cached, so the next call retries and rethrows.
		return (this.asyncStorage ??= loadAsyncStorage());
	}

	async getItem(key: string) {
		return this.load().getItem(key);
	}

	async setItem(key: string, value: string) {
		return this.load().setItem(key, value);
	}

	async removeItem(key: string) {
		return this.load().removeItem(key);
	}

	async clear() {
		return this.load().clear();
	}

	async getAllKeys() {
		return this.load().getAllKeys();
	}

	async multiRemove(keys: readonly string[]) {
		return this.load().multiRemove(keys);
	}
}
