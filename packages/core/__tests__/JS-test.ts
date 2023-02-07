import {
	isEmpty,
	sortByField,
	objectLessAttributes,
	filenameToContentType,
	isTextFile,
	transferKeyToLowerCase,
	transferKeyToUpperCase,
	isStrictObject,
} from '../src/JS';

describe('JS test', () => {
	describe('isEmpty test', () => {
		test('happy case', () => {
			const obj = { a: 'a' };
			expect(isEmpty(obj)).toBe(false);
		});
	});

	describe('sortByField test', () => {
		test('happy case with ascending order', () => {
			const arr = [{ a: 2 }, { a: 3 }, { a: 1 }];

			sortByField(arr, 'a', null);

			expect(arr).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
		});

		test('happy case with descending order', () => {
			const arr = [{ a: 2 }, { a: 3 }, { a: 1 }];

			sortByField(arr, 'a', 'desc');

			expect(arr).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }]);
		});

		test('no list do nothing', () => {
			expect(sortByField()).toEqual(false);
		});

		test('undefined means less', () => {
			const arr = [{ a: 2 }, {}, { a: 1 }, {}];

			sortByField(arr, 'a', 'desc');

			expect(arr).toEqual([{ a: 2 }, { a: 1 }, {}, {}]);
		});

		test('equal no change', () => {
			const arr = [
				{ a: 1, b: 1 },
				{ a: 1, b: 2 },
			];

			sortByField(arr, 'a', 'desc');

			expect(arr).toEqual([
				{ a: 1, b: 1 },
				{ a: 1, b: 2 },
			]);
		});
	});

	describe('objectLessAttributes test', () => {
		test('happy case with nothing', () => {
			const obj = { a: 3, b: 2 };

			expect(objectLessAttributes(obj)).toEqual({ a: 3, b: 2 });
		});

		test('happy case with string', () => {
			const obj = { a: 3, b: 2 };

			expect(objectLessAttributes(obj, 'a')).toEqual({ b: 2 });
		});

		test('happy case with array', () => {
			const obj = { a: 3, b: 2, c: 1 };

			expect(objectLessAttributes(obj, ['a', 'b'])).toEqual({ c: 1 });
		});
	});

	describe('filenameToContentType test', () => {
		test('.png file type is image/png', () => {
			expect(filenameToContentType('a.png')).toEqual('image/png');
		});

		test('unknown file type is application/octet-stream', () => {
			expect(filenameToContentType('a.xyz')).toEqual(
				'application/octet-stream'
			);
		});

		test('unknown file type is default', () => {
			expect(filenameToContentType('a.xyz', '*/*')).toEqual('*/*');
		});
	});

	describe('isTextFile test', () => {
		test('application/json is text file', () => {
			expect(isTextFile('application/json')).toEqual(true);
		});

		test('application/xml is text file', () => {
			expect(isTextFile('application/xml')).toEqual(true);
		});

		test('application/sh is text file', () => {
			expect(isTextFile('application/sh')).toEqual(true);
		});

		test('text/* is text file', () => {
			expect(isTextFile('text/*')).toEqual(true);
		});
	});

	describe('transferKeyToLowerCase test', () => {
		test('happy case', () => {
			const obj = {
				A: {
					A1: {
						Val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			};

			expect(transferKeyToLowerCase(obj)).toEqual({
				a: {
					a1: {
						val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			});
		});

		test('whiteList iteself', () => {
			const obj = {
				A: {
					A1: {
						Val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			};

			expect(transferKeyToLowerCase(obj, ['A'])).toEqual({
				A: {
					a1: {
						val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			});
		});

		test('whiteList children', () => {
			const obj = {
				A: {
					A1: {
						Val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			};

			expect(transferKeyToLowerCase(obj, [], ['A'])).toEqual({
				a: {
					A1: {
						Val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			});
		});
	});

	describe('transferKeyToUpperCase test', () => {
		test('happy case', () => {
			const obj = {
				a: {
					a1: {
						val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			};

			expect(transferKeyToUpperCase(obj)).toEqual({
				A: {
					A1: {
						Val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			});
		});

		test('whiteList iteself', () => {
			const obj = {
				a: {
					a1: {
						val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			};

			expect(transferKeyToUpperCase(obj, ['a'])).toEqual({
				a: {
					A1: {
						Val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			});
		});

		test('whiteList children', () => {
			const obj = {
				a: {
					a1: {
						val: 'val',
					},
				},
				b: {
					val: 'val',
				},
			};

			expect(transferKeyToUpperCase(obj, [], ['a'])).toEqual({
				A: {
					a1: {
						val: 'val',
					},
				},
				B: {
					Val: 'val',
				},
			});
		});
	});

	describe('isStrictObject test', () => {
		test('return true if the object is strict', () => {
			expect(isStrictObject({ a: '1' })).toBeTruthy();
		});

		test('return false if the object is null or array', () => {
			expect(isStrictObject(null)).toBeFalsy();
			expect(isStrictObject([])).toBeFalsy();
		});

		test('return false if the input is undefined, number, boolean or string', () => {
			expect(isStrictObject(undefined)).toBeFalsy();
			expect(isStrictObject(1)).toBeFalsy();
			expect(isStrictObject(false)).toBeFalsy();
			expect(isStrictObject('string')).toBeFalsy();
			expect(isStrictObject(new Number(1))).toBeFalsy();
			expect(isStrictObject(new Boolean(true))).toBeFalsy();
			expect(isStrictObject(new String('string'))).toBeFalsy();
			expect(isStrictObject(function () {})).toBeFalsy();
		});
	});
});
