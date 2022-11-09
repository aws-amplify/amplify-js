import { CacheConfig } from '../src/types/Cache';
import { StorageCache } from '../src/StorageCache';
import { defaultConfig } from '../src/Utils';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

const config: CacheConfig = {
	keyPrefix: 'aws-amplify#$#',
	capacityInBytes: 3000,
	itemMaxSize: 600,
	defaultTTL: 3000000,
	defaultPriority: 5,
	warningThreshold: 0.8,
};

describe('StorageCache', () => {
	describe('constructor', () => {
		test('set to default if config capacityInBytes is not integer', () => {
			const tmp = config.capacityInBytes;
			config.capacityInBytes = 1048576;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().capacityInBytes).toBe(
				defaultConfig.capacityInBytes
			);
			config.capacityInBytes = tmp;
		});

		test('set to default if config capacityInBytes is not integer', () => {
			const tmp = config.capacityInBytes;
			config.capacityInBytes = 1048576;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().capacityInBytes).toBe(
				defaultConfig.capacityInBytes
			);
			config.capacityInBytes = tmp;
		});

		test('set to default if config capacityInBytes is not integer', () => {
			const tmp = config.capacityInBytes;
			config.capacityInBytes = 1048576;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().capacityInBytes).toBe(
				defaultConfig.capacityInBytes
			);
			config.capacityInBytes = tmp;
		});

		test('set to default if config itemMaxSize is not integer', () => {
			const tmp = config.itemMaxSize;
			config.itemMaxSize = 210000;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().itemMaxSize).toBe(defaultConfig.itemMaxSize);
			config.itemMaxSize = tmp;
		});

		test('set to default if config defaultTTL is not integer', () => {
			const tmp = config.defaultTTL;
			config.defaultTTL = 259200000;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().defaultTTL).toBe(defaultConfig.defaultTTL);
			config.defaultTTL = tmp;
		});

		test('set to default if config defaultPriority is not integer', () => {
			const tmp = config.defaultPriority;
			config.defaultPriority = 5;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().defaultPriority).toBe(
				defaultConfig.defaultPriority
			);
			config.defaultPriority = tmp;
		});

		test('set to default if itemMaxSize is bigger then capacityInBytes', () => {
			const tmp = config.itemMaxSize;
			config.itemMaxSize = config.capacityInBytes * 2;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().itemMaxSize).toBe(defaultConfig.itemMaxSize);
			config.itemMaxSize = tmp;
		});

		test('set to default if defaultPriority is out of range', () => {
			const tmp = config.defaultPriority;
			config.defaultPriority = 0;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().defaultPriority).toBe(
				defaultConfig.defaultPriority
			);
			config.defaultPriority = 6;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().defaultPriority).toBe(
				defaultConfig.defaultPriority
			);
			config.defaultPriority = tmp;
		});

		test('set to default if warningThreshold is out of range', () => {
			const tmp = config.warningThreshold;
			config.warningThreshold = Math.random() + 1;
			const storage: StorageCache = new StorageCache(config);
			expect(storage.configure().warningThreshold).toBe(
				defaultConfig.warningThreshold
			);
			config.warningThreshold = tmp;
		});
	});

	describe('config test', () => {
		test('happy case', () => {
			const storage: StorageCache = new StorageCache(config);

			const customizedConfig: CacheConfig = {
				itemMaxSize: 1000,
			};

			const verifiedConfig = storage.configure(customizedConfig);

			expect(verifiedConfig.itemMaxSize).toBe(1000);
			expect(verifiedConfig).toEqual({
				capacityInBytes: 3000,
				defaultPriority: 5,
				defaultTTL: 3000000,
				itemMaxSize: 1000,
				keyPrefix: 'aws-amplify#$#',
				storage: undefined,
				warningThreshold: 0.8,
			});
		});

		test('give a error message if config has the keyPrefix', () => {
			const spyon = jest.spyOn(Logger.prototype, 'warn');
			const storage: StorageCache = new StorageCache(config);

			const customizedConfig: CacheConfig = {
				keyPrefix: 'abcc',
			};
			const new_config = storage.configure(customizedConfig);

			expect(spyon).toBeCalled();
		});
	});
});
