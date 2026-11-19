import { urlSafeEncode, urlSafeDecode } from '../../src/Util/StringUtils';

describe('urlSafeEncode', () => {
	it('should encode ASCII strings as two hexadecimal digits per character', () => {
		expect(urlSafeEncode('abc')).toBe('616263');
		expect(urlSafeEncode('/dashboard')).toBe('2f64617368626f617264');
		expect(urlSafeEncode('{"returnTo":"/"}')).toBe(
			'7b2272657475726e546f223a222f227d'
		);
	});

	it('should encode the full ASCII range the same way as before', () => {
		const ascii = Array.from({ length: 128 }, (_, i) =>
			String.fromCharCode(i)
		).join('');
		expect(urlSafeEncode(ascii)).toBe(
			Array.from({ length: 128 }, (_, i) =>
				i.toString(16).padStart(2, '0')
			).join('')
		);
	});

	it('should only emit hexadecimal characters', () => {
		// the encoded state is embedded after `generatedState-` in the OAuth
		// state parameter and split back apart with `state.split('-')`, so the
		// output must never contain a `-`
		expect(urlSafeEncode('/pl/łódź 設定 🚀')).toMatch(/^[0-9a-f]*$/);
	});

	it('should encode Latin-1 characters as UTF-8 byte pairs', () => {
		expect(urlSafeEncode('é')).toBe('c3a9');
		expect(urlSafeEncode('ñ')).toBe('c3b1');
	});

	it('should encode characters above U+00FF as multi-byte UTF-8', () => {
		expect(urlSafeEncode('ł')).toBe('c582'); // U+0142
		expect(urlSafeEncode('€')).toBe('e282ac'); // U+20AC
		expect(urlSafeEncode('設')).toBe('e8a8ad'); // U+8A2D
		expect(urlSafeEncode('🚀')).toBe('f09f9a80'); // U+1F680
	});

	it('should encode an empty string to an empty hex string', () => {
		expect(urlSafeEncode('')).toBe('');
	});
});

describe('urlSafeDecode', () => {
	it('should decode ASCII hexadecimal back to the original string', () => {
		expect(urlSafeDecode('616263')).toBe('abc');
		expect(urlSafeDecode('2f64617368626f617264')).toBe('/dashboard');
	});

	it('should decode UTF-8 byte sequences for characters above U+00FF', () => {
		expect(urlSafeDecode('c582')).toBe('ł');
		expect(urlSafeDecode('e282ac')).toBe('€');
		expect(urlSafeDecode('e8a8ad')).toBe('設');
		expect(urlSafeDecode('f09f9a80')).toBe('🚀');
	});

	it('should round trip the state payloads from the reported issue', () => {
		for (const str of ['/pl/łódź', '/ja/設定', '€5']) {
			expect(urlSafeDecode(urlSafeEncode(str))).toBe(str);
		}
	});

	it('should round trip boundary code points from every UTF-8 range', () => {
		const codePoints = [
			0x20, 0x2d, 0x41, 0x7e, 0x7f, 0x80, 0xff, 0x100, 0x7ff, 0x800, 0xffff,
			0x10000, 0x10ffff,
		];
		for (const codePoint of codePoints) {
			const str = String.fromCodePoint(codePoint);
			expect(urlSafeDecode(urlSafeEncode(str))).toBe(str);
		}
	});

	it('should return an empty string for empty input', () => {
		expect(urlSafeDecode('')).toBe('');
	});

	it('should not throw on non-hexadecimal input', () => {
		expect(() => urlSafeDecode('zz')).not.toThrow();
		expect(urlSafeDecode('zz')).toBe('\uFFFD');
	});

	it('should decode truncated UTF-8 sequences to replacement characters', () => {
		expect(urlSafeDecode('c5')).toBe('\uFFFD');
		expect(urlSafeDecode('e282')).toBe('\uFFFD\uFFFD');
		expect(urlSafeDecode('f09f')).toBe('\uFFFD\uFFFD');
	});

	it('should decode invalid UTF-8 sequences to replacement characters', () => {
		// 0x80 can never start a sequence
		expect(urlSafeDecode('80')).toBe('\uFFFD');
		// 0xc0 / 0xc1 can only start overlong encodings
		expect(urlSafeDecode('c0af')).toBe('\uFFFD\uFFFD');
		// 0xed 0xa0 0x80 would be a UTF-16 surrogate code point (U+D800)
		expect(urlSafeDecode('eda080')).toBe('\uFFFD\uFFFD\uFFFD');
		// 0xf4 0x90 0x80 0x80 would be above U+10FFFF
		expect(urlSafeDecode('f4908080')).toBe('\uFFFD\uFFFD\uFFFD\uFFFD');
	});
});
