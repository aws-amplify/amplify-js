import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../../src/foundation/convert';

describe('base64url', () => {
	it('converts ArrayBuffer values to base64url', () => {
		expect(convertArrayBufferToBase64Url(new Uint8Array([]))).toBe('');
		expect(convertArrayBufferToBase64Url(new Uint8Array([0]))).toBe('AA');
		expect(convertArrayBufferToBase64Url(new Uint8Array([1, 2, 3]))).toBe(
			'AQID',
		);
	});
	it('converts base64url values to ArrayBuffer', () => {
		expect(
			convertArrayBufferToBase64Url(convertBase64UrlToArrayBuffer('')),
		).toBe(convertArrayBufferToBase64Url(new Uint8Array([])));
		expect(
			convertArrayBufferToBase64Url(convertBase64UrlToArrayBuffer('AA')),
		).toBe(convertArrayBufferToBase64Url(new Uint8Array([0])));
		expect(
			convertArrayBufferToBase64Url(convertBase64UrlToArrayBuffer('AQID')),
		).toBe(convertArrayBufferToBase64Url(new Uint8Array([1, 2, 3])));
	});

	it('converts base64url to ArrayBuffer and back without data loss', () => {
		const input = '_h7NMedx8qUAz_yHKhgHt74P2UrTU_qcB4_ToULz12M';
		expect(
			convertArrayBufferToBase64Url(convertBase64UrlToArrayBuffer(input)),
		).toBe(input);
	});
});
