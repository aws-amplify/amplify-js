// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DATABASE_NAME, STORE_NAME } from './constants';
import { getAddItemBytesSize } from './getAddItemBytesSize';
import {
	AddItemWithAuthPropertiesWeb,
	QueuedItem,
	QueuedStorage,
} from './types';

export const createQueuedStorage = (): QueuedStorage => {
	let currentBytesSize = 0;
	let error: DOMException | undefined;

	const openDBPromise = new Promise<IDBDatabase>((resolve, reject) => {
		const { indexedDB } = window;
		const openRequest = indexedDB.open(DATABASE_NAME, 1);

		openRequest.onupgradeneeded = () => {
			const db = openRequest.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, {
					keyPath: 'id',
					autoIncrement: true,
				});
			}
		};

		openRequest.onsuccess = async () => {
			const db = openRequest.result;
			const transaction = db.transaction(STORE_NAME, 'readonly');
			const request = transaction.objectStore(STORE_NAME).getAll();

			await promisifyIDBRequest(request);

			for (const item of request.result) {
				currentBytesSize += (item as QueuedItem).bytesSize;
			}

			resolve(openRequest.result);
		};

		openRequest.onerror = () => {
			reject(openRequest.error);
		};
	}).catch(err => {
		error = err;
		return undefined;
	});

	const getDB = async () => {
		const db = await openDBPromise;

		if (!db) {
			throw error;
		}

		return db;
	};

	const getStore = async (): Promise<IDBObjectStore> => {
		const db = await getDB();
		const transaction = db.transaction(STORE_NAME, 'readwrite');
		return transaction.objectStore(STORE_NAME);
	};

	const _peek = async (n?: number): Promise<QueuedItem[]> => {
		const store = await getStore();
		const request = store.getAll(undefined, n);

		await promisifyIDBRequest(request);

		return request.result.map(item => item as QueuedItem);
	};

	return {
		async add(
			item,
			{ dequeueBeforeEnqueue } = { dequeueBeforeEnqueue: false }
		) {
			if (dequeueBeforeEnqueue) {
				const itemsToDelete = await this.peek(1);
				await this.delete(itemsToDelete);
			}

			const store = await getStore();

			const itemBytesSize = getAddItemBytesSize(item);
			const queuedItem: AddItemWithAuthPropertiesWeb = {
				...item,
				bytesSize: itemBytesSize,
			};

			const request = store.add(queuedItem);

			await promisifyIDBRequest(request);

			currentBytesSize += itemBytesSize;
		},
		async peek(n) {
			return _peek(n);
		},
		async peekAll() {
			return _peek();
		},
		async delete(items) {
			if (!items.length) {
				return;
			}

			const store = await getStore();

			// delete by range to improve performance
			const keyRangesToDelete = findRanges(
				items
					.map(item => item.id)
					.filter((id): id is number => id !== undefined)
			).map(([lower, upper]) => IDBKeyRange.bound(lower, upper));

			await Promise.all(
				keyRangesToDelete.map(range => promisifyIDBRequest(store.delete(range)))
			);

			for (const item of items) {
				currentBytesSize -= item.bytesSize;
			}
		},
		async clear() {
			const store = await getStore();
			await store.clear();
			currentBytesSize = 0;
		},
		isFull(maxBytesSizeInMiB) {
			return currentBytesSize >= maxBytesSizeInMiB * 1024 * 1024;
		},
	};
};

const promisifyIDBRequest = <T>(request: IDBRequest<T>): Promise<void> =>
	new Promise<void>((resolve, reject) => {
		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(request.error);
		};
	});

const findRanges = (input: number[]): [number, number][] => {
	const nums = input.concat().sort((a, b) => a - b);
	const result: [number, number][] = [];

	let rangeLength = 1;

	for (let i = 1; i <= nums.length; i++) {
		if (i === nums.length || nums[i] - nums[i - 1] !== 1) {
			if (rangeLength === 1) {
				result.push([nums[i - rangeLength], nums[i - rangeLength]]);
			} else {
				result.push([nums[i - rangeLength], nums[i - 1]]);
			}
			rangeLength = 1;
		} else {
			rangeLength += 1;
		}
	}

	return result;
};
