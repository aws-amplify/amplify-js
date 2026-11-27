// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type KeyValuePair = [string, string | null];

type MultiCallback = (errors?: readonly (Error | null)[] | null) => void;

/**
 * The AsyncStorage API that Amplify relies on. It is declared here rather than
 * imported because `@react-native-async-storage/async-storage` v3 no longer
 * exports the `AsyncStorageStatic` type.
 */
export interface AsyncStorageStatic {
	getItem(key: string): Promise<string | null>;
	setItem(key: string, value: string): Promise<void>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>;
	getAllKeys(): Promise<readonly string[]>;
	multiGet(keys: readonly string[]): Promise<readonly KeyValuePair[]>;
	multiSet(
		keyValuePairs: [string, string][],
		callback?: MultiCallback,
	): Promise<void>;
	multiRemove(keys: readonly string[], callback?: MultiCallback): Promise<void>;
}

/**
 * The batch API that replaces `multiGet`, `multiSet` and `multiRemove` in
 * `@react-native-async-storage/async-storage` v3.
 */
interface AsyncStorageV3
	extends Omit<AsyncStorageStatic, 'multiGet' | 'multiSet' | 'multiRemove'> {
	getMany(keys: string[]): Promise<Record<string, string | null>>;
	setMany(entries: Record<string, string>): Promise<void>;
	removeMany(keys: string[]): Promise<void>;
}

const isAsyncStorageV3 = (
	module: AsyncStorageStatic | AsyncStorageV3,
): module is AsyncStorageV3 =>
	typeof (module as AsyncStorageV3).getMany === 'function';

const notifyCallback = (operation: Promise<void>, callback?: MultiCallback) =>
	operation.then(
		() => {
			callback?.();
		},
		(error: Error) => {
			callback?.([error]);
			throw error;
		},
	);

const adaptAsyncStorageV3 = (storage: AsyncStorageV3): AsyncStorageStatic => ({
	getItem: key => storage.getItem(key),
	setItem: (key, value) => storage.setItem(key, value),
	removeItem: key => storage.removeItem(key),
	clear: () => storage.clear(),
	getAllKeys: () => storage.getAllKeys(),
	multiGet: async keys => {
		const values = await storage.getMany([...keys]);

		return keys.map<KeyValuePair>(key => [key, values[key] ?? null]);
	},
	multiSet: (keyValuePairs, callback) =>
		notifyCallback(
			storage.setMany(Object.fromEntries(keyValuePairs)),
			callback,
		),
	multiRemove: (keys, callback) =>
		notifyCallback(storage.removeMany([...keys]), callback),
});

export const loadAsyncStorage = (): AsyncStorageStatic => {
	try {
		// metro bundler requires static string for loading module.
		// See: https://facebook.github.io/metro/docs/configuration/#dynamicdepsinpackages
		const module = require('@react-native-async-storage/async-storage')
			?.default as AsyncStorageStatic | AsyncStorageV3;
		if (module) {
			return isAsyncStorageV3(module) ? adaptAsyncStorageV3(module) : module;
		}

		throw new Error(
			'Ensure `@react-native-async-storage/async-storage` is installed and linked.',
		);
	} catch (e) {
		// The error parsing logic cannot be extracted with metro as the `require`
		// would be confused when there is a `import` in the same file importing
		// another module and that causes an error
		const message = (e as Error).message.replace(
			/undefined/g,
			'@react-native-async-storage/async-storage',
		);
		throw new Error(message);
	}
};
