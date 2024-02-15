// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BigInteger } from '../src/providers/cognito/utils/srp/BigInteger';

describe('BigInteger', () => {
	describe('.toString(radix)', () => {
		it('should support positive numbers', () => {
			expect(new BigInteger('abcd1234', 16).toString(4)).toBe(
				'2223303101020310',
			);
		});

		it('should support negative numbers', () => {
			expect(new BigInteger('-abcd1234', 16).toString(4)).toBe(
				'-2223303101020310',
			);
		});
	});
});
