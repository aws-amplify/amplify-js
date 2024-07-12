// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isInvalidCredentialsError } from '../../../../src/clients/middleware/retry/isInvalidCredentialsError';

describe('isInvalidCredentialsError', () => {
	test('returns true if error code is an invalid token error', () => {
		expect(isInvalidCredentialsError('RequestExpired')).toBe(true);
		expect(isInvalidCredentialsError('ExpiredTokenException')).toBe(true);
		expect(isInvalidCredentialsError('ExpiredToken')).toBe(true);
	});

	test('returns false if error code is not an invalid token error', () => {
		expect(isInvalidCredentialsError('Foo')).toBe(false);
	});

	test('returns true if error message indicates invalid credentials', () => {
		expect(
			isInvalidCredentialsError(
				'InvalidSignature',
				'Auth token in request is expired.',
			),
		).toBe(true);
	});
});
