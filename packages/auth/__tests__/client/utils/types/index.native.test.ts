// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	assertValidNativeAuthenticationResponse,
	assertValidNativeRegistrationResponse,
	assertValidNativeResponse,
} from '../../../../src/client/utils/passkey/types/index.native';
import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../../src/client/utils/passkey/errors';

describe('Native type assertions', () => {
	describe('assertValidNativeResponse', () => {
		// ... first test case remains the same ...

		it('should throw for invalid response', () => {
			expect(() => {
				assertValidNativeResponse({});
			}).toThrow(
				new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Device failed to retrieve passkey.',
				}),
			);
		});

		it('should throw for null input', () => {
			expect(() => {
				assertValidNativeResponse(null);
			}).toThrow(
				new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Device failed to retrieve passkey.',
				}),
			);
		});
	});

	describe('assertValidNativeRegistrationResponse', () => {
		// ... first test case remains the same ...

		it('should throw for missing attestationObject', () => {
			const invalidResponse = {
				clientDataJSON: 'test-data',
			};

			expect(() => {
				assertValidNativeRegistrationResponse(invalidResponse);
			}).toThrow(
				new PasskeyError({
					name: PasskeyErrorCode.PasskeyRegistrationFailed,
					message: 'Device failed to create passkey.',
				}),
			);
		});
	});

	describe('assertValidNativeAuthenticationResponse', () => {
		// ... first test case remains the same ...

		it('should throw for missing authenticatorData', () => {
			const invalidResponse = {
				clientDataJSON: 'test-data',
				signature: 'test-signature',
			};

			expect(() => {
				assertValidNativeAuthenticationResponse(invalidResponse);
			}).toThrow(
				new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Device failed to retrieve passkey.',
				}),
			);
		});

		it('should throw for missing signature', () => {
			const invalidResponse = {
				clientDataJSON: 'test-data',
				authenticatorData: 'test-auth-data',
			};

			expect(() => {
				assertValidNativeAuthenticationResponse(invalidResponse);
			}).toThrow(
				new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Device failed to retrieve passkey.',
				}),
			);
		});
	});
});
