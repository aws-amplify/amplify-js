// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BigInteger } from '../../../../../../src/providers/cognito/utils/srp/BigInteger';
import { calculateU } from '../../../../../../src/providers/cognito/utils/srp/calculate';
import { getHashFromHex } from '../../../../../../src/providers/cognito/utils/srp/getHashFromHex';
import { getPaddedHex } from '../../../../../../src/providers/cognito/utils/srp/getPaddedHex';

jest.mock('../../../../../../src/providers/cognito/utils/srp/getHashFromHex');
jest.mock('../../../../../../src/providers/cognito/utils/srp/getPaddedHex');

describe('calculateU', () => {
	const A = new BigInteger('A', 16);
	const B = new BigInteger('B', 16);
	// create mocks
	const mockGetHashFromHex = getHashFromHex as jest.Mock;
	const mockGetPaddedHex = getPaddedHex as jest.Mock;

	beforeAll(() => {
		mockGetPaddedHex.mockReturnValue('');
	});

	afterEach(() => {
		mockGetHashFromHex.mockReset();
		mockGetPaddedHex.mockClear();
	});

	it('calculates U', () => {
		mockGetHashFromHex.mockReturnValue('A+B');

		expect(calculateU({ A, B })).toBeDefined();
		expect(mockGetPaddedHex).toBeCalledWith(A);
		expect(mockGetPaddedHex).toBeCalledWith(B);
		expect(mockGetHashFromHex).toBeCalled();
	});

	it('should throw an error if U equals BigInteger.ZERO', async () => {
		mockGetHashFromHex.mockReturnValue(BigInteger.ZERO);

		expect(() => {
			calculateU({ A, B });
		}).toThrow('U cannot be zero');
	});
});
