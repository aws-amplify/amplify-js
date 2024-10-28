import {
	deserializeJsonToPkcCreationOptions,
	serializePkcWithAttestationToJson,
} from '../../../src/client/utils/passkey/serde';
import {
	passkeyRegistrationRequest,
	passkeyRegistrationRequestJson,
	passkeyRegistrationResult,
	passkeyRegistrationResultJson,
} from '../../mockData';

describe('passkey', () => {
	it('serializes pkc into correct json format', () => {
		expect(
			JSON.stringify(
				serializePkcWithAttestationToJson(passkeyRegistrationResult),
			),
		).toBe(JSON.stringify(passkeyRegistrationResultJson));
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
