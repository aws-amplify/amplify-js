// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAsyncStorage } from '@aws-amplify/react-native';

import {
	createQueuedStorage,
	keyPrefix,
} from '../../../src/utils/queuedStorage/createQueuedStorage.native';
import {
	ItemToAdd,
	QueuedItem,
	QueuedStorage,
} from '../../../src/utils/queuedStorage/types';
import { getAddItemBytesSize } from '../../../src/utils/queuedStorage/getAddItemBytesSize';

jest.mock('@aws-amplify/react-native', () => ({
	loadAsyncStorage: jest.fn(() => ({
		getAllKeys: mockGetAllKeys,
		getItem: jest.fn(),
		multiGet: mockMultiGet,
		setItem: mockSetItem,
		removeItem: jest.fn(),
		multiRemove: mockMultiRemove,
	})),
}));

const mockGetAllKeys = jest.fn();
const mockMultiGet = jest.fn();
const mockSetItem = jest.fn();
const mockMultiRemove = jest.fn();
const mockLoadAsyncStorage = loadAsyncStorage as jest.Mock;

describe('createQueuedStorage', () => {
	const mockTimestamp = new Date('2024-01-02').toUTCString();

	describe('initialization', () => {
		let queuedStorage: QueuedStorage;
		const testBytesSize = 1;
		const mockKeys = [`${keyPrefix}_key1`, `${keyPrefix}_key2`];
		const mockQueuedItems = [
			{
				key: mockKeys[0],
				content: 'content1',
				timestamp: mockTimestamp,
				get bytesSize() {
					return (testBytesSize / 2) * 1024 * 1024;
				},
			},
			{
				key: mockKeys[1],
				content: 'content2',
				timestamp: mockTimestamp,
				get bytesSize() {
					return (testBytesSize / 2) * 1024 * 1024;
				},
			},
		];

		beforeAll(() => {
			mockGetAllKeys.mockResolvedValue(mockKeys);
			mockMultiGet.mockResolvedValue(
				mockQueuedItems.map((item, index) => [
					mockKeys[index],
					JSON.stringify(item),
				]),
			);

			queuedStorage = createQueuedStorage();
		});

		afterAll(() => {
			mockGetAllKeys.mockClear();
			mockMultiGet.mockClear();
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

		it('invokes loadAsyncStorage to get async storage', () => {
			expect(mockLoadAsyncStorage).toHaveBeenCalledTimes(1);
		});

		it('invokes AsyncStorage related APIs to set up the database', async () => {
			expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledWith(mockKeys);
		});

		it('calculates the queue item bytes size', () => {
			expect(queuedStorage.isFull(testBytesSize)).toBe(true);
		});
	});

	describe('error loading async storage', () => {
		const expectedError = new Error('some error');

		beforeEach(() => {
			mockLoadAsyncStorage.mockImplementationOnce(() => {
				throw expectedError;
			});
		});

		afterAll(() => {
			mockGetAllKeys.mockClear();
			mockMultiGet.mockClear();
		});

		test.each([
			['add', {}],
			['peek', 1],
			['peekAll', undefined],
			['delete', [{}]],
			['clear', undefined],
		] as unknown as [keyof QueuedStorage, any])(
			'when invokes %s it throws',
			async (method: keyof QueuedStorage, args: any) => {
				const storage = createQueuedStorage();
				await expect(storage[method](args)).rejects.toThrow(expectedError);
			},
		);
	});

	describe('method add()', () => {
		let queuedStorage: QueuedStorage;
		let dateNowSpy: jest.SpyInstance;
		const testInput: ItemToAdd = {
			content: 'some log content',
			timestamp: mockTimestamp,
		};

		beforeAll(() => {
			dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(123);
			queuedStorage = createQueuedStorage();
		});

		afterAll(() => {
			dateNowSpy.mockRestore();
		});

		afterEach(() => {
			mockSetItem.mockClear();
			mockMultiRemove.mockClear();
			mockGetAllKeys.mockClear();
			mockMultiGet.mockClear();
		});

		it('adds item to async storage', async () => {
			await queuedStorage.add(testInput);

			expect(mockSetItem).toHaveBeenCalledTimes(1);
			expect(mockSetItem).toHaveBeenCalledWith(
				`${keyPrefix}_123`,
				JSON.stringify({
					content: 'some log content',
					timestamp: mockTimestamp,
					bytesSize: getAddItemBytesSize(testInput),
					key: `${keyPrefix}_123`,
				}),
			);
		});

		it('dequeues the first item before adds the new item', async () => {
			const mockQueuedItems = [
				{
					key: `${keyPrefix}_key1`,
					content: '123',
					timestamp: mockTimestamp,
					bytesSize: 1,
				},
			];
			mockMultiGet.mockResolvedValueOnce(
				mockQueuedItems.map(item => [item.key, JSON.stringify(item)]),
			);

			await queuedStorage.add(testInput, { dequeueBeforeEnqueue: true });

			expect(mockMultiRemove).toHaveBeenCalledTimes(1);
			expect(mockMultiRemove).toHaveBeenCalledWith([mockQueuedItems[0].key]);
			expect(mockSetItem).toHaveBeenCalledTimes(1);
			expect(mockSetItem).toHaveBeenCalledWith(
				`${keyPrefix}_123`,
				JSON.stringify({
					content: 'some log content',
					timestamp: mockTimestamp,
					bytesSize: getAddItemBytesSize(testInput),
					key: `${keyPrefix}_123`,
				}),
			);
		});
	});

	describe('method peek() and peekAll()', () => {
		let queuedStorage: QueuedStorage;

		const mockQueuedItems = [
			{
				key: `${keyPrefix}_key1`,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				key: `${keyPrefix}_key2`,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
		];

		beforeAll(() => {
			queuedStorage = createQueuedStorage();
			// clear the call made from the above line
			mockGetAllKeys.mockClear();
		});

		beforeEach(() => {
			mockMultiGet.mockClear();
		});

		afterEach(() => {
			mockGetAllKeys.mockClear();
			mockMultiGet.mockClear();
		});

		test('peek() returns specified number of queued items', async () => {
			mockGetAllKeys.mockResolvedValueOnce(
				mockQueuedItems.map(item => item.key),
			);
			mockMultiGet.mockResolvedValueOnce([
				[mockQueuedItems[0].key, JSON.stringify(mockQueuedItems[0])],
			]);

			const result = await queuedStorage.peek(1);

			expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledWith([mockQueuedItems[0].key]);
			expect(result).toHaveLength(1);
		});

		test('peekAll() returns all queued items', async () => {
			mockGetAllKeys.mockResolvedValueOnce(
				mockQueuedItems.map(item => item.key),
			);
			mockMultiGet.mockResolvedValueOnce(
				mockQueuedItems.map(item => [item.key, JSON.stringify(item)]),
			);

			const result = await queuedStorage.peekAll();
			expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledTimes(1);
			expect(mockMultiGet).toHaveBeenCalledWith(
				mockQueuedItems.map(item => item.key),
			);
			expect(result).toHaveLength(mockQueuedItems.length);
		});
	});

	describe('method delete()', () => {
		const testItems: QueuedItem[] = [
			{
				key: `${keyPrefix}_key1`,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				key: `${keyPrefix}_key2`,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
			{
				key: `${keyPrefix}_key1000`,
				content: '123',
				timestamp: mockTimestamp,
				bytesSize: 1,
			},
		];

		let queuedStorage: QueuedStorage;

		beforeAll(() => {
			queuedStorage = createQueuedStorage();
		});

		afterAll(() => {
			mockGetAllKeys.mockClear();
			mockMultiRemove.mockClear();
		});

		it('invokes async storage multiRemove with keys to delete', async () => {
			await queuedStorage.delete(testItems);

			expect(mockMultiRemove).toHaveBeenCalledTimes(1);
			expect(mockMultiRemove).toHaveBeenCalledWith(
				testItems.map(item => item.key),
			);
		});
	});

	describe('method clear()', () => {
		let queuedStorage: QueuedStorage;
		const testAllKeys = [
			`${keyPrefix}_key1`,
			`${keyPrefix}_key2`,
			`${keyPrefix}_key3`,
			'some_other_key',
			'@user_app_key',
		];

		beforeAll(() => {
			queuedStorage = createQueuedStorage();
			// clear the call made from the above line
			mockGetAllKeys.mockClear();
		});

		it('invokes async storage APIs to delete all relevant items', async () => {
			mockGetAllKeys.mockResolvedValueOnce(testAllKeys);
			await queuedStorage.clear();

			expect(mockGetAllKeys).toHaveBeenCalledTimes(1);
			expect(mockMultiRemove).toHaveBeenCalledTimes(1);
			expect(mockMultiRemove).toHaveBeenCalledWith(
				testAllKeys.filter(key => key.startsWith(keyPrefix)),
			);
		});
	});
});
