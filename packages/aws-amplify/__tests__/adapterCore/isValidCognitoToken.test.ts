// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isValidCognitoToken } from '../../src/adapter-core/isValidCognitoToken';

describe('isValidCognitoToken', () => {
	it('returns true when verifier succeeds', async () => {
		const verifier = { verify: jest.fn().mockResolvedValue({}) } as any;
		expect(await isValidCognitoToken({ token: 'tok', verifier })).toBe(true);
	});

	it('returns true for expired tokens (JwtExpiredError)', async () => {
		const { JwtExpiredError } = await import('aws-jwt-verify/error');
		const verifier = {
			verify: jest
				.fn()
				.mockRejectedValue(new JwtExpiredError('expired', 'tok' as any)),
		} as any;
		expect(await isValidCognitoToken({ token: 'tok', verifier })).toBe(true);
	});

	it('returns false for other errors', async () => {
		const verifier = {
			verify: jest.fn().mockRejectedValue(new Error('bad')),
		} as any;
		expect(await isValidCognitoToken({ token: 'tok', verifier })).toBe(false);
	});
});
