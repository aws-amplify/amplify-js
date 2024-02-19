// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';

import {
	AddItemWithAuthPropertiesNative,
	QueuedItem,
	QueuedStorage,
} from './types';
import { DATABASE_NAME } from './constants';
import { getAddItemBytesSize } from './getAddItemBytesSize';

export const keyPrefix = `@${DATABASE_NAME}`;

export const createQueuedStorage = (): QueuedStorage => {
	let currentBytesSize = 0;
	let error: Error | undefined;

	const openDBPromise = new Promise<
		ReturnType<typeof loadAsyncStorage> | undefined
	>((resolve, _reject) => {
		try {
			const asyncStorage = loadAsyncStorage();

			getQueuedItemKeys(asyncStorage)
				.then(keys => getQueuedItems(asyncStorage, keys))
				.then(items => {
					for (const item of items) {
						currentBytesSize += item.bytesSize;
					}

					return undefined;
				})
				.then(__ => {
					resolve(asyncStorage);
				});
		} catch (err) {
			error = err as Error;
			resolve(undefined);
		}
	});

	const getAsyncStorage = async () => {
		const as = await openDBPromise;

		if (!as) {
			throw error;
		}

		return as;
	};

	const _peek = async (n?: number): Promise<QueuedItem[]> => {
		const as = await getAsyncStorage();
		const queuedItemKeys = await getQueuedItemKeys(as, true);
		const keysToGetValues = queuedItemKeys.slice(0, n);

		return getQueuedItems(as, keysToGetValues);
	};

	return {
		async add(
			item,
			{ dequeueBeforeEnqueue } = { dequeueBeforeEnqueue: false },
		) {
			if (dequeueBeforeEnqueue) {
				const itemsToDelete = await this.peek(1);
				await this.delete(itemsToDelete);
			}

			const as = await getAsyncStorage();
			const itemBytesSize = getAddItemBytesSize(item);
			const key = `${keyPrefix}_${Date.now()}`;
			const queuedItem: AddItemWithAuthPropertiesNative = {
				...item,
				bytesSize: itemBytesSize,
				key,
			};

			await as.setItem(key, JSON.stringify(queuedItem));

			currentBytesSize += itemBytesSize;
		},
		async peek(n) {
			return _peek(n);
		},
		async peekAll() {
			return _peek();
		},
		async delete(items) {
			const as = await getAsyncStorage();
			const keysToDelete = items
				.map(item => item.key)
				.filter((id): id is string => id !== undefined);

			await as.multiRemove(keysToDelete);

			for (const item of items) {
				currentBytesSize -= item.bytesSize;
			}
		},
		async clear() {
			const as = await getAsyncStorage();
			const keysToDelete = await getQueuedItemKeys(as);
			await as.multiRemove(keysToDelete);
			currentBytesSize = 0;
		},
		isFull(maxBytesSizeInMiB) {
			return currentBytesSize >= maxBytesSizeInMiB * 1024 * 1024;
		},
	};
};

const getQueuedItemKeys = async (
	as: ReturnType<typeof loadAsyncStorage>,
	sortKeys = false,
): Promise<string[]> => {
	const keys = (await as.getAllKeys()).filter(key => key.startsWith(keyPrefix));

	return sortKeys
		? keys.sort((a, b) => {
				const timestampA = a.split('_').pop() as string;
				const timestampB = b.split('_').pop() as string;

				return parseInt(timestampA) - parseInt(timestampB);
			})
		: keys;
};

const getQueuedItems = async (
	as: ReturnType<typeof loadAsyncStorage>,
	keys: string[],
): Promise<QueuedItem[]> =>
	(await as.multiGet(keys))
		.filter((item): item is [string, string] => item[1] !== null)
		.map(([_, value]) => JSON.parse(value) as QueuedItem);
