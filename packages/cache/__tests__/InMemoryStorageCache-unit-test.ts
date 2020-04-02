import { default as cache, InMemoryCacheClass } from '../src/InMemoryCache';
import { defaultConfig, getByteLength } from '../src/Utils/CacheUtils';
import { CacheConfig, CacheItem, CacheItemOptions } from '../src/types/Cache';

function getItemSize(value: string): number {
	const currTime: Date = new Date();
	const ret: CacheItem = {
		key: defaultConfig.keyPrefix + 'a',
		data: value,
		timestamp: currTime.getTime(),
		visitedTime: currTime.getTime(),
		priority: 5,
		expires: currTime.getTime(),
		type: typeof value,
		byteSize: 0,
	};
	ret.byteSize = getByteLength(JSON.stringify(ret));
	ret.byteSize = getByteLength(JSON.stringify(ret));
	return ret.byteSize;
}

const config: CacheConfig = {
	capacityInBytes: 3000,
	itemMaxSize: 600,
	defaultTTL: 3000000,
	defaultPriority: 5,
	warningThreshold: 0.8,
	storage: window.localStorage,
};

cache.configure(config);

describe('InMemoryCache', () => {
	const cache_size = config['capacityInBytes'] || defaultConfig.capacityInBytes;
	const default_ttl = config['defaultTTL'] || defaultConfig.defaultTTL;
	const item_max_size = config['itemMaxSize'] || defaultConfig.itemMaxSize;

	let regularItem: string = '';
	// item size would be 339 Byte
	for (let i = 0; i < item_max_size / 2; i++) {
		regularItem += 'a';
	}

	const regularItemSize: number = getItemSize(regularItem);
	const maxItemNum: number = Math.floor(cache_size / regularItemSize);

	if (maxItemNum > default_ttl) {
		console.error('incorrect paratmeter for test!');
	}

	const spyonConsoleWarn = jest.spyOn(console, 'warn');

	describe('setItem test', () => {
		test('put string, happy case', () => {
			let key: string = 'a';
			cache.setItem(key, regularItem);
			expect(cache.getItem(key)).toBe(regularItem);

			cache.clear();
		});

		test('put object, happy case', () => {
			let key: string = 'a';
			const item: object = { abc: 123, edf: 456 };
			cache.setItem(key, item);
			expect(cache.getItem(key)).toEqual(item);

			cache.clear();
		});

		test('put number, happy case', () => {
			let key: string = 'a';
			const item: number = 12345;
			cache.setItem(key, item);
			expect(cache.getItem(key)).toBe(item);

			cache.clear();
		});

		test('put boolean, happy case', () => {
			let key: string = 'a';
			const item: boolean = false;
			cache.setItem(key, item);
			expect(cache.getItem(key)).toBe(item);

			cache.clear();
		});

		test('abort and output console warning when trying to put one big item', () => {
			let value: string;
			let key: string = 'b';
			for (let i = 0; i < item_max_size * 2; i++) {
				value += 'a';
			}

			cache.setItem(key, value);
			expect(spyonConsoleWarn).toBeCalled();
			expect(cache.getItem(key)).toBe(null);
			spyonConsoleWarn.mockReset();
		});

		test('abort and output console warning when invalid keys', () => {
			cache.setItem('', 'abc');
			expect(spyonConsoleWarn).toBeCalled();
			spyonConsoleWarn.mockReset();

			cache.setItem('CurSize', 'abc');
			expect(spyonConsoleWarn).toBeCalled();
			spyonConsoleWarn.mockReset();
		});

		test('abort and output console warning if wrong CacheConfigOptions', () => {
			cache.setItem('a', 'abc', { priority: 0 });
			expect(spyonConsoleWarn).toBeCalled();
			expect(cache.getItem('a')).toBeNull();
			spyonConsoleWarn.mockReset();

			cache.setItem('a', 'abc', { priority: 6 });
			expect(spyonConsoleWarn).toBeCalled();
			expect(cache.getItem('a')).toBeNull();
			spyonConsoleWarn.mockReset();
		});

		test('abort and output console warning if value is undefined', () => {
			cache.setItem('a', undefined);
			expect(spyonConsoleWarn).toBeCalled();
			expect(cache.getItem('a')).toBeNull();
			spyonConsoleWarn.mockReset();
		});

		test('update the cache content if same key in the cache when setItem invoked', () => {
			const key: string = 'a';
			const val1: string = 'abc';
			const val2: string = 'cbaabc';

			cache.setItem(key, val1);
			const cacheSizeBefore = cache.getCacheCurSize();
			expect(cache.getItem(key)).toBe(val1);
			cache.setItem(key, val2);
			const cacheSizeAfter = cache.getCacheCurSize();
			expect(cache.getItem(key)).toBe(val2);

			expect(cacheSizeAfter - cacheSizeBefore).toBe(
				getItemSize(val2) - getItemSize(val1)
			);
			cache.clear();
		});

		test('pop low priority items when cache is full', () => {
			let key: string;
			const ttl: number = 300;
			// default priority is 5
			const priority: number = 4;

			let keysPoped: string[] = [];
			// fill the cache
			for (let i = 0; i < maxItemNum; i++) {
				key = i.toString();
				if (i == 0) {
					cache.setItem(key, regularItem, { priority: 4 });
					keysPoped.push(key);
				} else cache.setItem(key, regularItem, { priority: 3 });
			}

			for (let i = 0; i < keysPoped.length; i++) {
				expect(cache.getItem(keysPoped[i])).not.toBeNull();
			}

			key = maxItemNum.toString();
			cache.setItem(key, regularItem);

			for (let i = 0; i <= maxItemNum; i++) {
				if (i < keysPoped.length) {
					expect(cache.getItem(keysPoped[i])).toBeNull();
				} else {
					expect(cache.getItem(i.toString())).not.toBeNull();
				}
			}

			cache.clear();
		});

		test('pop last visited items when same priority', () => {
			let key: string = 'a';
			const dateSpy = jest.spyOn(Date.prototype, 'getTime');
			let keysPoped: string[] = [];

			for (let i = 0; i < maxItemNum; i++) {
				key = i.toString();
				dateSpy.mockImplementation(() => {
					return 1434319925275 + i;
				});
				if (i == 0) {
					keysPoped.push(key);
				}
				cache.setItem(key, regularItem);
			}

			key = maxItemNum.toString();
			cache.setItem(key, regularItem);

			for (let i = 0; i < keysPoped.length; i++) {
				expect(cache.getItem(keysPoped[i])).toBeNull();
			}

			cache.clear();
			dateSpy.mockRestore();
		});
	});

	describe('getItem test', () => {
		test('get item, happy case', () => {
			let key: string = 'a';

			cache.setItem(key, regularItem);
			expect(cache.getItem(key)).toBe(regularItem);
			cache.clear();
		});

		test('item get cleaned if expired when trying to get it', () => {
			const timeSpy = jest.spyOn(Date.prototype, 'getTime');
			let key: string = 'a';

			for (let i = 0; i < maxItemNum / 2; i++) {
				key = i.toString();
				timeSpy.mockImplementation(() => {
					return 1434319925275 + i * default_ttl;
				});
				cache.setItem(key, regularItem);
			}

			expect(cache.getItem('0')).toBeNull();
			timeSpy.mockRestore();
			cache.clear();
		});

		test('return null when no such key in the cache', () => {
			expect(cache.getItem('abc')).toBeNull();
		});

		test('item get refreshed when fetched from cache', () => {
			let key: string = 'a';

			const timeSpy = jest.spyOn(Date.prototype, 'getTime');
			for (let i = 0; i < maxItemNum; i++) {
				key = i.toString();
				timeSpy.mockImplementation(() => {
					// to ensure no item is expired
					return 1434319925275 + i * (default_ttl / (maxItemNum * 2));
				});
				cache.setItem(key, regularItem);
			}

			// refreshed
			cache.getItem('0');

			key = maxItemNum.toString();
			cache.setItem(key, regularItem);

			expect(cache.getItem('0')).not.toBeNull();
			expect(cache.getItem('1')).toBeNull();
			//myHandler.showTheList();
			cache.clear();
			timeSpy.mockRestore();
		});

		test('execute function if specified when no such key in cache', () => {
			const execFunc: Function = data => {
				return data * 5;
			};

			expect(
				cache.getItem('a', {
					callback: () => {
						return execFunc(5);
					},
				})
			).toBe(25);

			expect(cache.getItem('a')).toBe(25);

			cache.clear();
			//expect(cache.getItem('a', callback)).toBe(5);
		});

		test('output a console warning and return null if invalid keys', () => {
			cache.getItem('');
			expect(spyonConsoleWarn).toBeCalled();
			spyonConsoleWarn.mockReset();

			cache.getItem('CurSize');
			expect(spyonConsoleWarn).toBeCalled();
			spyonConsoleWarn.mockReset();
		});
	});

	describe('removeItem test', () => {
		test('remove cache, happy case', () => {
			let key: string = 'a';
			cache.setItem(key, regularItem);
			expect(cache.getItem(key)).not.toBeNull();

			cache.removeItem(key);
			expect(cache.getItem(key)).toBeNull();

			cache.clear();
		});
	});

	describe('clear test', () => {
		test('clear the cache', () => {
			let key: string = 'a';
			for (let i = 0; i < maxItemNum / 2; i++) {
				key = i.toString();
				cache.setItem(key, regularItem);
			}

			key = 'a';
			for (let i = 0; i < maxItemNum / 2; i++) {
				key = i.toString();
				expect(cache.getItem(key)).not.toBeNull();
			}

			cache.clear();

			key = 'a';
			for (let i = 0; i < maxItemNum / 2; i++) {
				key = i.toString();
				expect(cache.getItem(key)).toBeNull();
			}
		});
	});

	describe('getItemCursize test', () => {
		test('return 0 if cache is empty', () => {
			expect(cache.getCacheCurSize()).toBe(0);
		});

		test('return cache currrent size if not empty', () => {
			let key: string = 'a';
			for (let i = 0; i < maxItemNum; i++) {
				key = i.toString();
				cache.setItem(key, regularItem);
			}

			expect(cache.getCacheCurSize()).toBe(regularItemSize * maxItemNum);

			cache.clear();
			console.log(String.fromCharCode(0xdc33));
		});
	});

	describe('getAllKeys test', () => {
		test('happy case', async () => {
			await cache.setItem('a', 123);
			await cache.setItem('b', 'abc');
			await cache.setItem('c', { abc: 123 });

			expect.assertions(1);
			expect(await cache.getAllKeys()).toEqual(['a', 'b', 'c']);
			await cache.clear();
		});
	});

	describe('createInstance', () => {
		test('happy case, return new instance', () => {
			expect(cache.createInstance({ keyPrefix: 'abc' })).toBeInstanceOf(
				InMemoryCacheClass
			);
		});
	});
});
