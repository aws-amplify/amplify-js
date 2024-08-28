import {
	bothNilOrEqual,
	isNil,
} from '../../../../../../../src/providers/s3/utils/client/utils/integrityHelpers';

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
