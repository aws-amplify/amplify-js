import {
	bothNilOrEqual,
	isEqual,
	isNil,
	isObject,
} from '../../../../../../src/providers/s3/utils/client/utils/integrityHelpers';

describe('isNil', () => {
	it.each([
		['undefined', undefined, true],
		['null', null, true],
		['object', {}, false],
		['string', 'string', false],
		['empty string', '', false],
		['false', false, false],
	])('should correctly evaluate %s', (_, input, expected) => {
		expect(isNil(input)).toBe(expected);
	});
});

describe('bothNilorEqual', () => {
	it.each([
		['both undefined', undefined, undefined, true],
		['both null', null, null, true],
		['null and undefined', null, undefined, true],
		['both equal', 'mock', 'mock', true],
		['undefined and falsy', undefined, '', false],
		['truthy and null', 'mock', null, false],
		['different strings', 'mock-1', 'mock-2', false],
	])(
		'should correctly compare %s',
		(_, original: any, output: any, expected) => {
			expect(bothNilOrEqual(original, output)).toBe(expected);
		},
	);
});

describe('Integrity Helpers Tests', () => {
	describe('isObjectLike', () => {
		// Generate all test cases for isObjectLike function here
		test.each([
			[{}, true],
			[{ a: 1 }, true],
			[[1, 2, 3], false],
			[null, false],
			[undefined, false],
			['', false],
			[1, false],
		])('isObjectLike(%p) = %p', (value, expected) => {
			expect(isObject(value)).toBe(expected);
		});
	});

	describe('isEqual', () => {
		test.each([
			[1, 1, true],
			[1, 2, false],
			[1, '1', false],
			['1', '1', true],
			['1', '2', false],
			[{ a: 1 }, { a: 1 }, true],
			[{ a: 1 }, { a: 2 }, false],
			[{ a: 1 }, { b: 1 }, false],
			[[1, 2], [1, 2], true],
			[[1, 2], [2, 1], false],
			[[1, 2], [1, 2, 3], false],
		])('isEqual(%p, %p) = %p', (a, b, expected) => {
			expect(isEqual(a, b)).toBe(expected);
		});
	});
});
