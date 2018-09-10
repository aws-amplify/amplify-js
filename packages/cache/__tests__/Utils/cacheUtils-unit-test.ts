import { getByteLength, getCurrTime } from '../../src/Utils/CacheUtils';

describe('CacheUtils', () => {
    describe('getByteLength test', () => {
        test('happy case', () => {
            const str: string = 'abc';
            expect(getByteLength(str)).toBe(3);

            const str2: string = String.fromCharCode(0x80);
            expect(getByteLength(str2)).toBe(2);

            const str3: string = String.fromCharCode(0x800);
            expect(getByteLength(str3)).toBe(3);
        });
    });
});