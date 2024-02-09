// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DATABASE_NAME,
	STORE_NAME,
} from '../../../src/utils/queuedStorage/constants';
import { createQueuedStorage } from '../../../src/utils/queuedStorage/createQueuedStorage';
import { getAddItemBytesSize } from '../../../src/utils/queuedStorage/getAddItemBytesSize';
import {
	ItemToAdd,
	QueuedItem,
	QueuedStorage,
} from '../../../src/utils/queuedStorage/types';

describe('createQueuedStorage', () => {
	let originalIndexedDB;
	let originalIDBKeyRange;
	const mockTimestamp = new Date('2024-01-02').toUTCString();
	const mockAdd = jest.fn(() => ({
		set onsuccess(handler) {
			handler();
		},
		set onerror(handler) {
			handler();
		},
	}));
	const mockClear = jest.fn();
	const mockGetAll = jest.fn(() => ({
		set onsuccess(handler) {
			handler();
		},
		set onerror(handler) {
			handler();
		},
		result: [] as QueuedItem[],
	}));
	const mockDelete = jest.fn(() => ({
		set onsuccess(handler) {
			handler();
		},
		set onerror(handler) {
			handler();
		},
	}));
	const mockObjectStore = jest.fn(() => ({
		add: mockAdd,
		delete: mockDelete,
		clear: mockClear,
		getAll: mockGetAll,
	}));
	const mockTransaction = jest.fn(() => ({
		objectStore: mockObjectStore,
	}));
	const mockDB = {
		transaction: mockTransaction,
		objectStoreNames: {
			contains: jest.fn(),
		},
		createObjectStore: jest.fn(),
	};
	const mockIndexedDBOpenRequest = {
		set onupgradeneeded(handler) {
			handler();
		},
		set onsuccess(handler) {
			handler();
		},
		set onerror(_) {},
		result: mockDB,
	};
	const mockIndexedDBOpen = jest.fn(() => mockIndexedDBOpenRequest);
	const mockIndexedDB = {
		open: mockIndexedDBOpen,
	};
	const mockIDBKeyRange = {
		bound: jest.fn((lower, upper) => [lower, upper]),
	};

	let queuedStorage: QueuedStorage;

	beforeAll(() => {
		mockClear.mockResolvedValue(undefined);

		originalIndexedDB = window.indexedDB;
		originalIDBKeyRange = window.IDBKeyRange;
		window.indexedDB = mockIndexedDB as any;
		window.IDBKeyRange = mockIDBKeyRange as any;
	});

	afterAll(() => {
		window.indexedDB = originalIndexedDB;
		window.IDBKeyRange = originalIDBKeyRange;
	});

	describe('initialization', () => {
		const testBytesSize = 1;
		const mockQueuedItems = [
			{
				id: 1,
				content: '123',
				timestamp: mockTimestamp,
				get bytesSize() {
					return (testBytesSize / 2) * 1024 * 1024;
				},
			},
			{
				id: 2,
				content: '1234',
				timestamp: mockTimestamp,
				get bytesSize() {
					return (testBytesSize / 2) * 1024 * 1024;
				},
			},
		];

		beforeAll(async () => {
			mockGetAll.mockReturnValueOnce({
				set onsuccess(handler) {
					handler();
				},
				set onerror(_) {},
				result: mockQueuedItems,
			});
			queuedStorage = createQueuedStorage();
		});

		afterAll(() => {
			mockGetAll.mockClear();
		});

		it('creates a queued storage with expected apis', () => {
			expect(queuedStorage).toMatchObject({
				add: expect.any(Function),
				peek: expect.any(Function),
				peekAll: expect.any(Function),
				delete: expect.any(Function),
				clear: expect.any(Function),
				isFull: expect.any(Function),
			});
		});

		it('invokes window.indexedDB related APIs set up the database', async () => {
			// open database
			expect(mockIndexedDBOpen).toHaveBeenCalledTimes(1);
			expect(mockIndexedDBOpen).toHaveBeenCalledWith(DATABASE_NAME, 1);

			// create data store
			expect(mockDB.objectStoreNames.contains).toHaveBeenCalledTimes(1);
			expect(mockDB.objectStoreNames.contains).toHaveBeenCalledWith(STORE_NAME);
			expect(mockDB.createObjectStore).toHaveBeenCalledTimes(1);
			expect(mockDB.createObjectStore).toHaveBeenCalledWith(STORE_NAME, {
				keyPath: 'id',
				autoIncrement: true,
			});

			// calculate current store bytes size on load
			expect(mockDB.transaction).toHaveBeenCalledTimes(1);
			expect(mockDB.transaction).toHaveBeenCalledWith(STORE_NAME, 'readonly');
		});

		it('calculates the queue item bytes size', () => {
			expect(queuedStorage.isFull(testBytesSize)).toBe(true);
		});
	});

	describe('error opening indexedDB', () => {
		const expectedError = new DOMException('some error');

		beforeEach(() => {
			mockIndexedDBOpen.mockReturnValueOnce({
				set onupgradeneeded(handler) {
					handler();
				},
				set onsuccess(_) {},
				set onerror(handler) {
					handler();
				},
				error: expectedError,
				result: mockDB,
			} as any);
		});

		test.each([
			['add', {}],
			['peek', 1],
			['peekAll', undefined],
			['delete', [{}]],
			['clear', undefined],
		])('when invokes %s it throws', async (method, args) => {
			const storage = createQueuedStorage();
			await expect(storage[method](args)).rejects.toThrow(expectedError);
		});
	});

	describe('method add()', () => {
		const testInput: ItemToAdd = {
			content: 'some log content',
			timestamp: mockTimestamp,
		};

		afterEach(() => {
			mockAdd.mockClear();
			mockGetAll.mockClear();
			mockDelete.mockClear();
			mockIDBKeyRange.bound.mockClear();
		});

		it('adds item to the indexedDB', async () => {
			await queuedStorage.add(testInput);

			expect(mockAdd).toHaveBeenCalledTimes(1);
			expect(mockAdd).toHaveBeenCalledWith({
				content: 'some log content',
				timestamp: mockTimestamp,
				bytesSize: getAddItemBytesSize(testInput),
			});
		});

		it('dequeues the first item before adds the new item', async () => {
			const mockQueuedItems = [
				{
					id: 3,
					content: '123',
					timestamp: mockTimestamp,
					bytesSize: 1,
				},
			];

			mockGetAll.mockReturnValueOnce({
				set onsuccess(handler) {
					handler();
				},
				set onerror(_) {},
				result: mockQueuedItems,
			});

			await queuedStorage.add(testInput, { dequeueBeforeEnqueue: true });

			expect(mockDelete).toHaveBeenCalledTimes(1);
			expect(mockDelete).toHaveBeenCalledWith([3, 3]); // id: 3 - range 3, 3
			expect(mockAdd).toHaveBeenCalledTimes(1);
			expect(mockAdd).toHaveBeenCalledWith({
				content: 'some log content',
				timestamp: mockTimestamp,
				bytesSize: getAddItemBytesSize(testInput),
			});
		});
	});

	describe('method peek() and peekAll()', () => {
		const mockQueuedItems = [
			{
				id: 3,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 5,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
		];

		afterEach(() => {
			mockGetAll.mockClear();
		});

		test('peek() returns specified number of queued items', async () => {
			mockGetAll.mockReturnValueOnce({
				set onsuccess(handler) {
					handler();
				},
				set onerror(_) {},
				result: [mockQueuedItems[0]],
			});
			const result = await queuedStorage.peek(1);

			expect(mockGetAll).toHaveBeenCalledTimes(1);
			expect(mockGetAll).toHaveBeenCalledWith(undefined, 1);
			expect(result).toHaveLength(1);
		});

		test('peekAll() returns all queued items', async () => {
			mockGetAll.mockReturnValueOnce({
				set onsuccess(handler) {
					handler();
				},
				set onerror(_) {},
				result: mockQueuedItems,
			});

			const result = await queuedStorage.peekAll();
			expect(mockGetAll).toHaveBeenCalledTimes(1);
			expect(mockGetAll).toHaveBeenCalledWith(undefined, undefined);
			expect(result).toHaveLength(mockQueuedItems.length);
		});
	});

	describe('method delete()', () => {
		const testItems = [
			{
				id: 2,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 5,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 6,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 7,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 11,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				id: 12,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
		];

		afterEach(() => {
			mockDelete.mockClear();
			mockIDBKeyRange.bound.mockClear();
		});

		it('deletes items by key ranges', async () => {
			await queuedStorage.delete(testItems);

			expect(mockIDBKeyRange.bound).toHaveBeenCalledTimes(3);
			expect(mockIDBKeyRange.bound.mock.calls).toEqual([
				[2, 2],
				[5, 7],
				[11, 12],
			]);

			expect(mockDelete).toHaveBeenCalledTimes(3);
			expect(mockDelete.mock.calls).toEqual([[[2, 2]], [[5, 7]], [[11, 12]]]);
		});

		it('does nothing when there is nothing to delete', async () => {
			await queuedStorage.delete([]);

			expect(mockIDBKeyRange.bound).not.toHaveBeenCalled();
			expect(mockDelete).not.toHaveBeenCalled();
		});
	});

	describe('method clear()', () => {
		afterEach(() => {
			mockClear.mockClear();
		});

		it('invokes indexedDB store clear method', async () => {
			await queuedStorage.clear();

			expect(mockClear).toHaveBeenCalledTimes(1);
		});
	});
});
