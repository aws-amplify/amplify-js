import { getByteLength } from '../../../src/Cache/utils/cacheHelpers';

describe('cacheHelpers', () => {
	describe('getByteLength()', () => {
		test('happy case', () => {
			const str = 'abc';
			expect(getByteLength(str)).toBe(3);

			const str2: string = String.fromCharCode(0x80);
			expect(getByteLength(str2)).toBe(2);

			const str3: string = String.fromCharCode(0x800);
			expect(getByteLength(str3)).toBe(3);
		});
	});
});
