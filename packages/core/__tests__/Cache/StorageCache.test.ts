import { CacheConfig } from '../../src/Cache/types/Cache';
import { defaultConfig } from '../../src/Cache/constants';
import { StorageCache } from '../../src/Cache/StorageCache';
import { getCurrentSizeKey } from '../../src/Cache/utils';
import { getLocalStorageWithFallback } from '../../src/storage/utils';

jest.mock('../../src/Cache/utils');
jest.mock('../../src/storage/utils');

describe('StorageCache', () => {
	const keyPrefix = 'key-prefix-';
	const currentSizeKey = `${keyPrefix}current-size-key`;
	const config: CacheConfig = {
		keyPrefix,
		capacityInBytes: 3000,
		itemMaxSize: 600,
		defaultTTL: 3000000,
		defaultPriority: 5,
		warningThreshold: 0.8,
	};
	// create mocks
	const mockGetLocalStorageWithFallback =
		getLocalStorageWithFallback as jest.Mock;
	const mockGetCurrentSizeKey = getCurrentSizeKey as jest.Mock;
	const mockStorageSetItem = jest.fn();
	const mockStorageGetItem = jest.fn();
	const mockStorageRemoveItem = jest.fn();
	const mockStorageClear = jest.fn();
	const mockStorageKey = jest.fn();
	const mockStorage: Storage = {
		setItem: mockStorageSetItem,
		getItem: mockStorageGetItem,
		removeItem: mockStorageRemoveItem,
		clear: mockStorageClear,
		key: mockStorageKey,
		length: 0,
	};
	// extend class for testing
	class StorageCacheTest extends StorageCache {
		testGetConfig() {
			return this.config;
		}

		testGetAllCacheKeys(options?: { omitSizeKey?: boolean }) {
			return this.getAllCacheKeys(options);
		}
	}
	// create test helpers
	const getStorageCache = (config?: CacheConfig) =>
		new StorageCacheTest(config);

	beforeAll(() => {
		mockGetCurrentSizeKey.mockReturnValue(currentSizeKey);
	});

	beforeEach(() => {
		mockGetLocalStorageWithFallback.mockReturnValue(mockStorage);
	});

	afterEach(() => {
		mockGetLocalStorageWithFallback.mockReset();
		mockStorageKey.mockReset();
	});

	describe('constructor', () => {
		it('can be constructed with default configurations', () => {
			const cache = getStorageCache();
			expect(mockGetLocalStorageWithFallback).toBeCalled();
			expect(cache.testGetConfig()).toStrictEqual(defaultConfig);
		});

		it('can be constructed with custom configurations', () => {
			const cache = getStorageCache(config);
			expect(mockGetLocalStorageWithFallback).toBeCalled();
			expect(cache.testGetConfig()).toStrictEqual(config);
		});
	});

	describe('getAllCacheKeys()', () => {
		const keys = ['current-size-key', 'key-1', 'key-2'];
		const cachedKeys = keys.map(key => `${keyPrefix}${key}`);

		beforeEach(() => {
			mockStorageKey.mockImplementation((index: number) => cachedKeys[index]);
			mockGetLocalStorageWithFallback.mockReturnValue({
				...mockStorage,
				length: cachedKeys.length,
			});
		});

		it('returns all cache keys', async () => {
			const cache = getStorageCache(config);

			expect(await cache.testGetAllCacheKeys()).toStrictEqual(keys);
		});

		it('can omit the size key', async () => {
			const cache = getStorageCache(config);

			expect(
				await cache.testGetAllCacheKeys({ omitSizeKey: true })
			).toStrictEqual(keys.slice(1));
		});

		it('only returns keys that it owns', async () => {
			const extendedCachedKeys = [
				...keys.map(key => `${keyPrefix}${key}`),
				'some-other-prefixed-key',
			];
			mockStorageKey.mockImplementation(
				(index: number) => extendedCachedKeys[index]
			);
			mockGetLocalStorageWithFallback.mockReturnValue({
				...mockStorage,
				length: extendedCachedKeys.length,
			});
			const cache = getStorageCache(config);

			expect(
				await cache.testGetAllCacheKeys({ omitSizeKey: true })
			).toStrictEqual(keys.slice(1));
		});
	});

	describe('createInstance()', () => {
		const cache = getStorageCache(config);

		it('returns a new instance', () => {
			const newConfig: CacheConfig = {
				...config,
				keyPrefix: 'foo-',
			};
			const instance = cache.createInstance(newConfig);
			expect(instance).toBeInstanceOf(StorageCache);
			expect(instance).not.toBe(cache);
		});
	});
});
