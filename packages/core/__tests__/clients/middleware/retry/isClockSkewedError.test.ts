// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isClockSkewError } from '../../../../src/clients/middleware/retry/isClockSkewError';

describe('isClockSkewError', () => {
	test('returns true if error code is a clock skew error', () => {
		expect(isClockSkewError('RequestInTheFuture')).toBe(true);
		expect(isClockSkewError('RequestTimeTooSkewed')).toBe(true);
	});

	test('returns false if error code is not a clock skew error', () => {
		expect(isClockSkewError('Foo')).toBe(false);
	});
});
