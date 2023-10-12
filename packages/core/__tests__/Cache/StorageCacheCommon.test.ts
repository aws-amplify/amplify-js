import { CacheConfig } from '../../src/Cache/types/Cache';
import { defaultConfig } from '../../src/Cache/constants';
import { StorageCacheCommon } from '../../src/Cache/StorageCacheCommon';
import { KeyValueStorageInterface } from '../../src/types';
import { ConsoleLogger } from '../../src/Logger';
import {
	getByteLength,
	getCurrentSizeKey,
	getCurrentTime,
} from '../../src/Cache/utils';

jest.mock('../../src/Cache/utils');

describe('StorageCacheCommon', () => {
	const keyPrefix = 'key-prefix-';
	const currentSizeKey = `${keyPrefix}current-size-key`;
	const key = 'key';
	const prefixedKey = `${keyPrefix}${key}`;
	const currentTime = 1600412400000;
	const config: CacheConfig = {
		keyPrefix,
		capacityInBytes: 3000,
		itemMaxSize: 600,
		defaultTTL: 3000000,
		defaultPriority: 5,
		warningThreshold: 0.8,
	};
	// create spies
	const loggerSpy = {
		debug: jest.spyOn(ConsoleLogger.prototype, 'debug'),
		error: jest.spyOn(ConsoleLogger.prototype, 'error'),
		warn: jest.spyOn(ConsoleLogger.prototype, 'warn'),
	};
	// create mocks
	const mockGetByteLength = getByteLength as jest.Mock;
	const mockGetCurrentSizeKey = getCurrentSizeKey as jest.Mock;
	const mockGetCurrentTime = getCurrentTime as jest.Mock;
	const mockKeyValueStorageSetItem = jest.fn();
	const mockKeyValueStorageGetItem = jest.fn();
	const mockKeyValueStorageRemoveItem = jest.fn();
	const mockKeyValueStorageClear = jest.fn();
	const mockGetAllCacheKeys = jest.fn();
	const mockKeyValueStorage: KeyValueStorageInterface = {
		setItem: mockKeyValueStorageSetItem,
		getItem: mockKeyValueStorageGetItem,
		removeItem: mockKeyValueStorageRemoveItem,
		clear: mockKeyValueStorageClear,
	};
	// extend class for testing
	class StorageCacheCommonTest extends StorageCacheCommon {
		getAllCacheKeys() {
			return mockGetAllCacheKeys();
		}

		testGetConfig() {
			return this.config;
		}
	}
	// create test helpers
	const getStorageCache = (config?: CacheConfig) =>
		new StorageCacheCommonTest({
			config,
			keyValueStorage: mockKeyValueStorage,
		});

	beforeAll(() => {
		// suppress console log
		for (const level in loggerSpy) {
			loggerSpy[level].mockImplementation(jest.fn);
		}
		mockGetCurrentSizeKey.mockReturnValue(currentSizeKey);
	});

	beforeEach(() => {
		mockGetCurrentTime.mockReturnValue(currentTime);
	});

	afterEach(() => {
		// clear mocks
		for (const level in loggerSpy) {
			loggerSpy[level].mockClear();
		}
		mockKeyValueStorageSetItem.mockClear();
		mockKeyValueStorageRemoveItem.mockClear();
		mockKeyValueStorageClear.mockClear();
		// reset mocks
		mockGetByteLength.mockReset();
		mockKeyValueStorageGetItem.mockReset();
		mockGetAllCacheKeys.mockReset();
	});

	describe('constructor', () => {
		it('reverts to default itemMaxSize if it is set larger than capacityInBytes', () => {
			const cache = getStorageCache({
				...config,
				itemMaxSize: config.capacityInBytes * 2,
			});
			expect(cache.testGetConfig().itemMaxSize).toBe(defaultConfig.itemMaxSize);
			expect(loggerSpy.error).toBeCalled();
		});

		it('reverts to default defaultPriority if it is set below minimum range', () => {
			const cache = getStorageCache({
				...config,
				defaultPriority: 0,
			});
			expect(cache.testGetConfig().defaultPriority).toBe(
				defaultConfig.defaultPriority
			);
			expect(loggerSpy.error).toBeCalled();
		});

		it('reverts to default defaultPriority if it is set above maximum range', () => {
			const cache = getStorageCache({
				...config,
				defaultPriority: 6,
			});
			expect(cache.testGetConfig().defaultPriority).toBe(
				defaultConfig.defaultPriority
			);
			expect(loggerSpy.error).toBeCalled();
		});

		it('reverts to default warningThreshold if it is set below minimum range', () => {
			const cache = getStorageCache({
				...config,
				warningThreshold: -1,
			});
			expect(cache.testGetConfig().warningThreshold).toBe(
				defaultConfig.warningThreshold
			);
			expect(loggerSpy.error).toBeCalled();
		});

		it('reverts to default warningThreshold if it is set above maximum range', () => {
			const cache = getStorageCache({
				...config,
				warningThreshold: 2,
			});
			expect(cache.testGetConfig().warningThreshold).toBe(
				defaultConfig.warningThreshold
			);
			expect(loggerSpy.error).toBeCalled();
		});

		it('reverts to default capacityInBytes if it is set larger than 5MB limit', () => {
			const cacheLimit = 5 * 1024 * 1024; // 5MB limit
			const cache = getStorageCache({
				...config,
				capacityInBytes: cacheLimit + 1,
			});
			expect(cache.testGetConfig().capacityInBytes).toBe(
				defaultConfig.capacityInBytes
			);
			expect(loggerSpy.error).toBeCalled();
		});
	});

	describe('configure()', () => {
		it('re-configures an instance', () => {
			const cache = getStorageCache(config);
			const updatedConfig = {
				capacityInBytes: 4000,
				itemMaxSize: 700,
				defaultTTL: 4000000,
				defaultPriority: 4,
				warningThreshold: 0.7,
			};

			expect(cache.configure(updatedConfig)).toStrictEqual({
				keyPrefix: config.keyPrefix,
				...updatedConfig,
			});
		});

		it('logs a warning if re-configured with keyPrefix', () => {
			const cache = getStorageCache(config);
			cache.configure(config);

			expect(loggerSpy.warn).toBeCalled();
		});
	});

	describe('getCurrentCacheSize()', () => {
		const cache = getStorageCache(config);

		it('returns the current cache size', async () => {
			mockKeyValueStorageGetItem.mockResolvedValue('10');
			expect(await cache.getCurrentCacheSize()).toBe(10);
			expect(mockKeyValueStorageGetItem).toBeCalledWith(currentSizeKey);
		});

		it('returns zero if size set to zero', async () => {
			mockKeyValueStorageGetItem.mockResolvedValue('0');
			expect(await cache.getCurrentCacheSize()).toBe(0);
			expect(mockKeyValueStorageSetItem).not.toBeCalled();
		});

		it('returns zero if size it not set', async () => {
			mockKeyValueStorageGetItem.mockResolvedValue(null);
			expect(await cache.getCurrentCacheSize()).toBe(0);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(currentSizeKey, '0');
		});
	});

	describe('setItem()', () => {
		const cache = getStorageCache(config);

		beforeEach(() => {
			mockKeyValueStorageGetItem.mockReturnValue(null);
		});

		afterEach(() => {
			mockKeyValueStorageGetItem.mockReset();
		});

		it.each([
			['string', 'x'.repeat(300)],
			['object', { abc: 123, edf: 456 }],
			['number', 1234],
			['boolean', true],
		])('sets an item if it does not exist (%s}', async (_, value: any) => {
			await cache.setItem(key, value);
			expect(loggerSpy.debug).toBeCalledWith(
				expect.stringContaining(`Set item: key is ${key}`)
			);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				expect.stringContaining(JSON.stringify(value))
			);
		});

		it('aborts on empty key', async () => {
			await cache.setItem('', 'abc');
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageSetItem).not.toBeCalled();
		});

		it('aborts on reserved key', async () => {
			await cache.setItem('CurSize', 'abc');
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageSetItem).not.toBeCalled();
		});

		it('aborts on undefined value', async () => {
			await cache.setItem(key, undefined);
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('should not be undefined')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('aborts if priority is below minimum', async () => {
			await cache.setItem(key, 'abc', { priority: 0 });
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid parameter')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('aborts if priority is above maximum', async () => {
			await cache.setItem(key, 'abc', { priority: 6 });
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid parameter')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('aborts if item size is above maximum', async () => {
			mockGetByteLength.mockImplementation(
				jest.requireActual('../../src/Cache/utils').getByteLength
			);
			const value = 'x'.repeat(config.itemMaxSize * 2);
			await cache.setItem(key, value);
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('is too big')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('updates existing cache content with the same key', async () => {
			const value = 'value';
			const currentItem = { byteSize: 10 };
			mockGetByteLength.mockReturnValue(20);
			mockKeyValueStorageGetItem
				.mockReturnValueOnce(JSON.stringify(currentItem)) // check for item
				.mockReturnValueOnce(JSON.stringify(currentItem)) // check before remove item
				.mockReturnValueOnce(25) // get current cache size (decrease)
				.mockReturnValueOnce(15) // get current cache size (full check)
				.mockReturnValueOnce(15); // get current cache size (increase)
			await cache.setItem(key, value);

			expect(mockKeyValueStorageGetItem).toBeCalledTimes(5);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(currentSizeKey, '15'); // 25 - 10
			expect(mockKeyValueStorageRemoveItem).toBeCalledTimes(1);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(currentSizeKey, '35'); // 15 + 20
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				JSON.stringify({
					key: prefixedKey,
					data: value,
					timestamp: currentTime,
					visitedTime: currentTime,
					priority: 5,
					expires: currentTime + config.defaultTTL,
					type: 'string',
					byteSize: 20,
				})
			);
		});

		it('tries to clear invalid keys when cache is full', async () => {
			const value = 'value';
			const expiredItem = { expires: currentTime - 10, byteSize: 10 };
			const validItem = { expires: currentTime + 10, byteSize: 10 };
			mockGetByteLength.mockReturnValue(20);
			mockKeyValueStorageGetItem
				.mockReturnValueOnce(null) // check for item
				.mockReturnValueOnce(3000) // get current cache size (full check)
				.mockReturnValueOnce(JSON.stringify(expiredItem)) // first expired check
				.mockReturnValueOnce(JSON.stringify(expiredItem)) // check before removing item
				.mockReturnValueOnce(25) // get current cache size (decrease)
				.mockReturnValueOnce(JSON.stringify(validItem)) // second expired check
				.mockReturnValueOnce(2000); // get current cache size (second full check)
			mockGetAllCacheKeys.mockReturnValue([
				`${keyPrefix}expired-key`,
				`${keyPrefix}valid-key`,
			]);
			await cache.setItem(key, value);
			expect(mockKeyValueStorageRemoveItem).toBeCalledTimes(1);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				expect.stringContaining(value)
			);
		});

		it('pops lower priority items when cache is full', async () => {
			const value = 'value';
			const baseItem = {
				expires: currentTime + 10,
				byteSize: 400,
			};
			const lowPriorityItem = {
				...baseItem,
				key: 'low-priority-key',
				priority: 4,
			};
			const mediumPriorityItem = {
				...baseItem,
				key: 'medium-priority-key',
				priority: 3,
			};
			const highPriorityItem = {
				...baseItem,
				key: 'high-priority-key',
				priority: 2,
			};
			mockGetByteLength.mockReturnValue(500);
			mockKeyValueStorageGetItem
				.mockReturnValueOnce(null) // check for item
				.mockReturnValueOnce(3000) // get current cache size (full check)
				.mockReturnValueOnce(JSON.stringify(mediumPriorityItem)) // first expired check
				.mockReturnValueOnce(JSON.stringify(highPriorityItem)) // second expired check
				.mockReturnValueOnce(JSON.stringify(lowPriorityItem)) // third expired check
				.mockReturnValueOnce(3000) // get current cache size (second full check)
				.mockReturnValueOnce(3000) // get current cache size (checking space for pop)
				.mockReturnValueOnce(JSON.stringify(mediumPriorityItem)) // first item check for pop
				.mockReturnValueOnce(JSON.stringify(highPriorityItem)) // second item check for pop
				.mockReturnValueOnce(JSON.stringify(lowPriorityItem)) // third item check for pop
				.mockReturnValueOnce(JSON.stringify(lowPriorityItem)) // check before removing item
				.mockReturnValueOnce(2900) // get current cache size (decrease)
				.mockReturnValueOnce(JSON.stringify(mediumPriorityItem)) // check before removing item
				.mockReturnValueOnce(2800); // get current cache size (decrease)
			mockGetAllCacheKeys.mockReturnValue([
				mediumPriorityItem.key,
				highPriorityItem.key,
				lowPriorityItem.key,
			]);
			await cache.setItem(key, value);
			expect(mockKeyValueStorageRemoveItem).toBeCalledTimes(2);
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(lowPriorityItem.key);
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(
				mediumPriorityItem.key
			);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				expect.stringContaining(value)
			);
		});

		it('pops last visited items if priorities are the same when cache is full', async () => {
			const value = 'value';
			const baseItem = {
				expires: currentTime + 10,
				byteSize: 400,
				priority: 3,
			};
			const lastVisitedItem = {
				...baseItem,
				key: `${keyPrefix}last-visited-key`,
				visitedTime: currentTime - 3000,
			};
			const recentlyVistedItem = {
				...baseItem,
				key: `${keyPrefix}recently-visited-key`,
				visitedTime: currentTime - 2000,
			};
			const mostRecentlyVisitedItem = {
				...baseItem,
				key: `${keyPrefix}most-recently-visited-key`,
				visitedTime: currentTime - 1000,
			};
			mockGetByteLength.mockReturnValue(300);
			mockKeyValueStorageGetItem
				.mockReturnValueOnce(null) // check for item
				.mockReturnValueOnce(3000) // get current cache size (full check)
				.mockReturnValueOnce(JSON.stringify(recentlyVistedItem)) // first expired check
				.mockReturnValueOnce(JSON.stringify(mostRecentlyVisitedItem)) // second expired check
				.mockReturnValueOnce(JSON.stringify(lastVisitedItem)) // third expired check
				.mockReturnValueOnce(3000) // get current cache size (second full check)
				.mockReturnValueOnce(3000) // get current cache size (checking space for pop)
				.mockReturnValueOnce(JSON.stringify(recentlyVistedItem)) // first item check for pop
				.mockReturnValueOnce(JSON.stringify(mostRecentlyVisitedItem)) // second item check for pop
				.mockReturnValueOnce(JSON.stringify(lastVisitedItem)) // third item check for pop
				.mockReturnValueOnce(JSON.stringify(lastVisitedItem)) // check before removing item
				.mockReturnValueOnce(2900) // get current cache size (decrease)
				.mockReturnValueOnce(JSON.stringify(recentlyVistedItem)) // check before removing item
				.mockReturnValueOnce(2800); // get current cache size (decrease)
			mockGetAllCacheKeys.mockReturnValue([
				recentlyVistedItem.key,
				mostRecentlyVisitedItem.key,
				lastVisitedItem.key,
			]);
			await cache.setItem(key, value);
			expect(mockKeyValueStorageRemoveItem).toBeCalledTimes(2);
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(lastVisitedItem.key);
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(
				recentlyVistedItem.key
			);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				expect.stringContaining(value)
			);
		});
	});

	describe('getItem()', () => {
		const value = 'value';
		const cache = getStorageCache(config);
		const key = 'key';
		const prefixedKey = `${keyPrefix}${key}`;

		beforeEach(() => {
			mockKeyValueStorageGetItem.mockReturnValue(null);
		});

		it('gets an item', async () => {
			mockKeyValueStorageGetItem.mockReturnValue(
				JSON.stringify({ data: value })
			);

			expect(await cache.getItem(key)).toBe(value);
			expect(loggerSpy.debug).toBeCalledWith(
				expect.stringContaining(`Get item: key is ${key}`)
			);
			expect(mockKeyValueStorageGetItem).toBeCalledWith(prefixedKey);
		});

		it('aborts on empty key', async () => {
			expect(await cache.getItem('')).toBeNull();
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('aborts on reserved key', async () => {
			expect(await cache.getItem('CurSize')).toBeNull();
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageGetItem).not.toBeCalled();
		});

		it('clears item if it expires when trying to get it', async () => {
			mockKeyValueStorageGetItem.mockReturnValue(
				JSON.stringify({
					data: value,
					byteSize: 10,
					expires: currentTime - 10,
				})
			);

			expect(await cache.getItem(key)).toBeNull();
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(prefixedKey);
		});

		it('returns null if not in cache', async () => {
			expect(await cache.getItem(key)).toBeNull();
		});

		it('updates item visitedTime when fetched from cache', async () => {
			const item = { data: value };
			mockKeyValueStorageGetItem.mockReturnValue(JSON.stringify(item));

			expect(await cache.getItem(key)).toBe(value);
			expect(mockKeyValueStorageGetItem).toBeCalledWith(prefixedKey);
			expect(mockKeyValueStorageSetItem).toBeCalledWith(
				prefixedKey,
				JSON.stringify({ ...item, visitedTime: currentTime })
			);
		});

		it('execute a callback if specified when key not found in cache', async () => {
			mockGetByteLength.mockReturnValue(20);
			const callback = jest.fn(() => value);
			expect(await cache.getItem(key, { callback })).toBe(value);
			expect(callback).toBeCalled();
			expect(mockKeyValueStorageSetItem).toBeCalled();
		});
	});

	describe('removeItem()', () => {
		const cache = getStorageCache(config);
		const key = 'key';
		const prefixedKey = `${keyPrefix}${key}`;

		beforeEach(() => {
			mockKeyValueStorageGetItem.mockReturnValue(
				JSON.stringify({ byteSize: 10 })
			);
		});

		it('removes an item', async () => {
			await cache.removeItem(key);
			expect(loggerSpy.debug).toBeCalledWith(
				expect.stringContaining(`Remove item: key is ${key}`)
			);
			expect(mockKeyValueStorageRemoveItem).toBeCalledWith(prefixedKey);
		});

		it('aborts on empty key', async () => {
			await cache.removeItem('');
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageRemoveItem).not.toBeCalled();
		});

		it('aborts on reserved key', async () => {
			await cache.removeItem('CurSize');
			expect(loggerSpy.warn).toBeCalledWith(
				expect.stringContaining('Invalid key')
			);
			expect(mockKeyValueStorageRemoveItem).not.toBeCalled();
		});

		it('does nothing if item not found', async () => {
			mockKeyValueStorageGetItem.mockReturnValue(null);
			await cache.removeItem(key);
			expect(mockKeyValueStorageRemoveItem).not.toBeCalled();
		});
	});

	describe('clear()', () => {
		const cache = getStorageCache(config);

		it('clears the cache, including the currentSizeKey', async () => {
			mockGetAllCacheKeys.mockReturnValue([
				currentSizeKey,
				`${keyPrefix}some-key`,
			]);
			await cache.clear();
			expect(loggerSpy.debug).toBeCalledWith('Clear Cache');
			expect(mockKeyValueStorageRemoveItem).toBeCalledTimes(2);
		});
	});

	describe('getAllKeys()', () => {
		const cache = getStorageCache(config);

		it('returns all cache keys', async () => {
			const keys = ['current-size-key', 'key-1', 'key-2'];
			mockGetAllCacheKeys.mockReturnValue(keys);

			expect(await cache.getAllKeys()).toStrictEqual(keys);
		});
	});
});
