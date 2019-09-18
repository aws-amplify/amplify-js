import CacheList from '../../src/Utils/CacheList';

describe('cacheList', () => {
	describe('isEmpty', () => {
		test('return true if list is empty', () => {
			const list: CacheList = new CacheList();
			expect(list.isEmpty()).toBe(true);
		});

		test('return false if list is full', () => {
			const list: CacheList = new CacheList();
			list.insertItem('a');
			expect(list.isEmpty()).toBe(false);
		});
	});

	describe('refresh', () => {
		test('list length keeps same', () => {
			const list: CacheList = new CacheList();

			for (let i = 0; i < 5; i++) {
				list.insertItem(i.toString());
			}
			const listLength: number = list.getSize();
			list.refresh('0');
			expect(list.getSize() === listLength).toBe(true);
		});

		test('move node to the head of the list', () => {
			const list: CacheList = new CacheList();

			for (let i = 0; i < 5; i++) {
				list.insertItem(i.toString());
			}

			expect(list.isHeadNode('2')).toBe(false);
			list.refresh('2');
			expect(list.isHeadNode('2')).toBe(true);
		});
	});

	describe('insertItem', () => {
		test('a node inserted at the head of the list', () => {
			const list: CacheList = new CacheList();
			for (let i = 0; i < 5; i++) {
				list.insertItem(i.toString());
			}

			expect(list.getSize()).toBe(5);
			expect(list.isHeadNode('4')).toBe(true);
		});
	});

	describe('getLastItem', () => {
		test('return the item at the last of the tail', () => {
			const list: CacheList = new CacheList();
			for (let i = 0; i < 5; i++) {
				list.insertItem(i.toString());
			}

			expect(list.isTailNode(list.getLastItem())).toBe(true);
		});

		test('return empty string if list is empty', () => {
			const list: CacheList = new CacheList();

			expect(list.getLastItem()).toBe('');
		});

		describe('removeItem', () => {
			test('delete one item in the list', () => {
				const list: CacheList = new CacheList();

				list.insertItem('0');
				expect(list.getSize()).toBe(1);
				expect(list.containsKey('0')).toBe(true);

				list.removeItem('0');
				expect(list.getSize()).toBe(0);
				expect(list.containsKey('0')).toBe(false);
			});
		});

		describe('getSize', () => {
			test('return the length of the list', () => {
				const list: CacheList = new CacheList();
				expect(list.getSize()).toBe(0);
				for (let i = 0; i < 5; i++) {
					list.insertItem(i.toString());
				}
				expect(list.getSize()).toBe(5);
			});
		});

		describe('containsKey', () => {
			test('return true if item is in the list', () => {
				const list: CacheList = new CacheList();
				expect(list.containsKey('0')).toBe(false);
				list.insertItem('0');
				expect(list.containsKey('0')).toBe(true);
			});
		});

		describe('clearList', () => {
			test('clear the whole list', () => {
				const list: CacheList = new CacheList();
				for (let i = 0; i < 5; i++) {
					list.insertItem(i.toString());
				}

				for (let i = 0; i < 5; i++) {
					expect(list.containsKey(i.toString())).toBe(true);
				}
				expect(list.getSize()).toBe(5);

				list.clearList();
				for (let i = 0; i < 5; i++) {
					expect(list.containsKey(i.toString())).toBe(false);
				}
				expect(list.getSize()).toBe(0);
			});
		});

		describe('getKeys', () => {
			test('get all keys in the list', () => {
				const list: CacheList = new CacheList();
				const keys: string[] = ['0', '1', '2'];
				for (let i = 0; i < keys.length; i++) {
					list.insertItem(keys[i]);
				}

				const listKeys: string[] = list.getKeys();
				for (let i = 0; i < listKeys.length; i++) {
					expect(listKeys[i]).toBe(keys[i]);
				}
			});
		});

		describe('isHeadNode', () => {
			test('return true if item is at the head of the list', () => {
				const list: CacheList = new CacheList();

				list.insertItem('0');
				list.insertItem('1');

				expect(list.isHeadNode('0')).toBe(false);
				expect(list.isHeadNode('1')).toBe(true);
			});
		});

		describe('isTailNode', () => {
			test('return true if item is at the tail of the list', () => {
				const list: CacheList = new CacheList();

				list.insertItem('0');
				list.insertItem('1');

				expect(list.isTailNode('0')).toBe(true);
				expect(list.isTailNode('1')).toBe(false);
			});
		});
	});
});
