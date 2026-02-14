// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { associateWebAuthnCredential, signIn } from '../src';

describe('associateWebAuthnCredential Integration Tests', () => {
	beforeEach(async () => {
		// Mock secure context
		Object.defineProperty(window, 'isSecureContext', {
			value: true,
			writable: true,
			configurable: true,
		});

		// Mock AuthenticatorAttestationResponse
		class MockAuthenticatorAttestationResponse {
			clientDataJSON: ArrayBuffer;
			attestationObject: ArrayBuffer;

			constructor(data: any) {
				this.clientDataJSON = data.clientDataJSON;
				this.attestationObject = data.attestationObject;
			}

			getPublicKey() {
				return new ArrayBuffer(65);
			}

			getPublicKeyAlgorithm() {
				return -7;
			}

			getTransports() {
				return ['usb', 'nfc'];
			}

			getAuthenticatorData() {
				return new ArrayBuffer(37);
			}
		}

		// Set as global
		(global as any).AuthenticatorAttestationResponse =
			MockAuthenticatorAttestationResponse;

		// Create a proper PublicKeyCredential mock class
		class MockPublicKeyCredential {
			id: string;
			rawId: ArrayBuffer;
			response: any;
			type: string;

			constructor(data: any) {
				this.id = data.id;
				this.rawId = data.rawId;
				this.response = data.response;
				this.type = data.type;
			}

			getClientExtensionResults() {
				return {};
			}

			static isUserVerifyingPlatformAuthenticatorAvailable() {
				return Promise.resolve(true);
			}

			static isConditionalMediationAvailable() {
				return Promise.resolve(true);
			}
		}

		// Set as global
		(global as any).PublicKeyCredential = MockPublicKeyCredential;

		// Mock navigator.credentials for WebAuthn
		const mockCredentials = {
			create: vi.fn().mockResolvedValue(
				new MockPublicKeyCredential({
					id: 'credential-12345',
					rawId: new ArrayBuffer(32),
					response: new MockAuthenticatorAttestationResponse({
						clientDataJSON: new ArrayBuffer(128),
						attestationObject: new ArrayBuffer(256),
					}),
					type: 'public-key',
				}),
			),
		};

		Object.defineProperty(navigator, 'credentials', {
			value: mockCredentials,
			writable: true,
			configurable: true,
		});

		// Sign in before WebAuthn operations
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully associate WebAuthn credential', async () => {
		await associateWebAuthnCredential();

		// No error means success
		expect(true).toBe(true);
	});
});
