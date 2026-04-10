// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createTokenValidator } from '../../src/adapter-core/createTokenValidator';

jest.mock('aws-jwt-verify', () => ({
	CognitoJwtVerifier: {
		create: jest.fn(() => ({
			verify: jest.fn().mockResolvedValue({}),
		})),
	},
}));

describe('createTokenValidator', () => {
	it('returns true for non-token keys', async () => {
		const validator = createTokenValidator({
			userPoolId: 'us-east-1_abc',
			userPoolClientId: 'client123',
		});
		expect(await validator.getItem!('someKey', 'val')).toBe(true);
	});

	it('validates access tokens', async () => {
		const validator = createTokenValidator({
			userPoolId: 'us-east-1_abc',
			userPoolClientId: 'client123',
		});
		expect(await validator.getItem!('user.accessToken', 'jwt')).toBe(true);
	});

	it('validates id tokens', async () => {
		const validator = createTokenValidator({
			userPoolId: 'us-east-1_abc',
			userPoolClientId: 'client123',
		});
		expect(await validator.getItem!('user.idToken', 'jwt')).toBe(true);
	});

	it('returns false when userPoolId is missing', async () => {
		const validator = createTokenValidator({});
		expect(await validator.getItem!('user.accessToken', 'jwt')).toBe(false);
	});
});
