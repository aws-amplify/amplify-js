// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listWebAuthnCredentials, signIn } from '../src';

import { mockWebAuthn } from './mocks/handlers';

describe('listWebAuthnCredentials Integration Tests', () => {
	beforeEach(async () => {
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully list WebAuthn credentials', async () => {
		const result = await listWebAuthnCredentials();

		expect(Array.isArray(result.credentials)).toBe(true);
		expect(result.credentials.length).toBe(1);
		expect(result.credentials[0].credentialId).toBe(mockWebAuthn.credentialId);
		expect(result.credentials[0].friendlyCredentialName).toBe(
			mockWebAuthn.friendlyName,
		);
		expect(result.credentials[0].relyingPartyId).toBe(
			mockWebAuthn.relyingPartyId,
		);
	});

	it('should return credentials array with authenticator transports', async () => {
		const result = await listWebAuthnCredentials();

		expect(Array.isArray(result.credentials)).toBe(true);
		expect(result.credentials[0].authenticatorTransports).toEqual(
			mockWebAuthn.authenticatorTransports,
		);
	});
});
