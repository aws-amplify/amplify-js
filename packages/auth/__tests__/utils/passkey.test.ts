import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../src/utils/passkey/base64Url';
import {
	deserializeJsonToPkcCreationOptions,
	serializePkcToJson,
} from '../../src/utils/passkey/serde';
import {
	passkeyRegistrationRequest,
	passkeyRegistrationRequestJson,
	passkeyRegistrationResult,
	passkeyRegistrationResultJson,
} from '../mockData';

describe('passkey', () => {
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

	it('serializes pkc into correct json format', () => {
		expect(JSON.stringify(serializePkcToJson(passkeyRegistrationResult))).toBe(
			JSON.stringify(passkeyRegistrationResultJson),
		);
	});

	it('deserializes json into correct pkc format', () => {
		const deserialized = deserializeJsonToPkcCreationOptions(
			passkeyRegistrationRequestJson,
		);

		expect(deserialized.challenge.byteLength).toEqual(
			passkeyRegistrationRequest.challenge.byteLength,
		);
		expect(deserialized.user.id.byteLength).toEqual(
			passkeyRegistrationRequest.user.id.byteLength,
		);

		expect(deserialized).toEqual(
			expect.objectContaining({
				rp: expect.any(Object),
				user: {
					id: expect.any(ArrayBuffer),
					name: expect.any(String),
					displayName: expect.any(String),
				},
				challenge: expect.any(ArrayBuffer),
				pubKeyCredParams: expect.any(Array),
				timeout: expect.any(Number),
				excludeCredentials: expect.any(Array),
				authenticatorSelection: expect.any(Object),
			}),
		);
	});
});
