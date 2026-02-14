// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { deleteWebAuthnCredential, signIn } from '../src';

describe('deleteWebAuthnCredential Integration Tests', () => {
	beforeEach(async () => {
		// Mock secure context
		Object.defineProperty(window, 'isSecureContext', {
			value: true,
			writable: true,
			configurable: true,
		});

		// Sign in before WebAuthn operations
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully delete WebAuthn credential', async () => {
		await deleteWebAuthnCredential({
			credentialId: 'credential-12345',
		});

		// No error means success
		expect(true).toBe(true);
	});
});
