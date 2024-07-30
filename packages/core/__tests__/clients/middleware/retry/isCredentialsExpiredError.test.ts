// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCredentialsExpiredError } from '../../../../src/clients/middleware/retry/isCredentialsExpiredError';

describe('isInvalidCredentialsError', () => {
	test('returns true if error code is an invalid token error', () => {
		expect(isCredentialsExpiredError('RequestExpired')).toBe(true);
		expect(isCredentialsExpiredError('ExpiredTokenException')).toBe(true);
		expect(isCredentialsExpiredError('ExpiredToken')).toBe(true);
	});

	test('returns false if error code is not an invalid token error', () => {
		expect(isCredentialsExpiredError('Foo')).toBe(false);
	});

	test('returns true if error message indicates invalid credentials', () => {
		expect(
			isCredentialsExpiredError(
				'InvalidSignature',
				'Auth token in request is expired.',
			),
		).toBe(true);
	});
});
