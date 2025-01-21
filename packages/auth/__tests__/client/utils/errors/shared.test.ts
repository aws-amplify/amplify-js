// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
	PkcDescriptor,
	assertValidCredentialCreationOptions,
} from '../../../../src/client/utils/passkey/types/shared';

describe('Shared Passkey Types', () => {
	describe('assertValidCredentialCreationOptions', () => {
		const validOptions: PasskeyCreateOptionsJson = {
			challenge: 'test-challenge',
			rp: {
				id: 'test-rp-id',
				name: 'test-rp-name',
			},
			user: {
				id: 'test-user-id',
				name: 'test-user',
				displayName: 'Test User',
			},
			pubKeyCredParams: [
				{
					alg: -7,
					type: 'public-key',
				},
			],
		};

		it('should not throw for valid options', () => {
			expect(() => {
				assertValidCredentialCreationOptions(validOptions);
			}).not.toThrow();
		});

		it('should throw for null input', () => {
			expect(() => {
				assertValidCredentialCreationOptions(null);
			}).toThrow('Invalid passkey registration options.');
		});

		it('should throw for missing challenge', () => {
			const invalidOptions = {
				...validOptions,
				challenge: undefined,
			};
			expect(() => {
				assertValidCredentialCreationOptions(invalidOptions);
			}).toThrow('Invalid passkey registration options.');
		});

		it('should throw for missing user', () => {
			const invalidOptions = {
				...validOptions,
				user: undefined,
			};
			expect(() => {
				assertValidCredentialCreationOptions(invalidOptions);
			}).toThrow('Invalid passkey registration options.');
		});

		it('should throw for missing rp', () => {
			const invalidOptions = {
				...validOptions,
				rp: undefined,
			};
			expect(() => {
				assertValidCredentialCreationOptions(invalidOptions);
			}).toThrow('Invalid passkey registration options.');
		});

		it('should throw for missing pubKeyCredParams', () => {
			const invalidOptions = {
				...validOptions,
				pubKeyCredParams: undefined,
			};
			expect(() => {
				assertValidCredentialCreationOptions(invalidOptions);
			}).toThrow('Invalid passkey registration options.');
		});
	});

	describe('Type validations', () => {
		describe('PkcDescriptor', () => {
			it('should accept valid transport types', () => {
				const validDescriptor: PkcDescriptor<string> = {
					type: 'public-key',
					id: 'test-id',
					transports: ['ble', 'nfc', 'usb', 'internal', 'hybrid'],
				};
				// TypeScript compilation would fail if types are invalid
				expect(validDescriptor.transports).toBeDefined();
			});
		});

		describe('PasskeyCreateResultJson', () => {
			it('should validate response structure', () => {
				const validResult: PasskeyCreateResultJson = {
					id: 'test-id',
					rawId: 'test-raw-id',
					type: 'public-key',
					clientExtensionResults: {},
					response: {
						clientDataJSON: 'test-client-data',
						attestationObject: 'test-attestation',
						transports: ['internal'],
						publicKeyAlgorithm: -7,
						authenticatorData: 'test-auth-data',
					},
				};
				// TypeScript compilation would fail if structure is invalid
				expect(validResult.response.attestationObject).toBeDefined();
			});
		});

		describe('PasskeyGetOptionsJson', () => {
			it('should validate options structure', () => {
				const validOptions: PasskeyGetOptionsJson = {
					challenge: 'test-challenge',
					rpId: 'test-rp',
					timeout: 60000,
					allowCredentials: [
						{
							type: 'public-key',
							id: 'test-id',
							transports: ['internal'],
						},
					],
					userVerification: 'preferred',
				};
				// TypeScript compilation would fail if structure is invalid
				expect(validOptions.userVerification).toBeDefined();
			});
		});

		describe('PasskeyGetResultJson', () => {
			it('should validate result structure', () => {
				const validResult: PasskeyGetResultJson = {
					id: 'test-id',
					rawId: 'test-raw-id',
					type: 'public-key',
					clientExtensionResults: {},
					response: {
						authenticatorData: 'test-auth-data',
						clientDataJSON: 'test-client-data',
						signature: 'test-signature',
					},
				};
				// TypeScript compilation would fail if structure is invalid
				expect(validResult.response.signature).toBeDefined();
			});
		});
	});
});
