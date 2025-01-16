import {
	NativeCredentialAssertionResponse,
	NativeCredentialAttestationResponse,
	isValidNativeResponse, // Remove 'type' from the import
} from '../../../../src/client/utils/passkey/types/native';

describe('Native type validations', () => {
	describe('isValidNativeResponse', () => {
		it('should validate attestation response', () => {
			const validAttestationResponse: NativeCredentialAttestationResponse = {
				clientDataJSON: 'test-data',
				attestationObject: 'test-attestation',
				transports: ['internal'],
			};

			expect(isValidNativeResponse(validAttestationResponse)).toBe(true);
		});

		it('should validate assertion response', () => {
			const validAssertionResponse: NativeCredentialAssertionResponse = {
				authenticatorData: 'test-auth-data',
				clientDataJSON: 'test-data',
				signature: 'test-signature',
			};

			expect(isValidNativeResponse(validAssertionResponse)).toBe(true);
		});

		it('should fail for invalid response', () => {
			const invalidResponse = {
				clientDataJSON: 'test-data',
			};

			expect(isValidNativeResponse(invalidResponse)).toBe(false);
		});

		it('should fail for null input', () => {
			const nullInput = null;
			expect(isValidNativeResponse(nullInput)).toBe(false);
		});

		it('should fail for non-object input', () => {
			const stringInput = 'string';
			expect(isValidNativeResponse(stringInput)).toBe(false);
		});
	});
});
