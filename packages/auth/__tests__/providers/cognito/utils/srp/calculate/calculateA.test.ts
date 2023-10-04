// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BigInteger } from '../../../../../../src/providers/cognito/utils/srp/BigInteger';
import { calculateA } from '../../../../../../src/providers/cognito/utils/srp/calculate';

describe('calculateA', () => {
	const a = new BigInteger('a', 16);
	const g = new BigInteger('g', 16);
	const N = new BigInteger('N', 16);
	// create spies
	const modPowSpy = jest.spyOn(BigInteger.prototype, 'modPow');

	afterEach(() => {
		modPowSpy.mockReset();
	});

	it('calculates A', async () => {
		expect(await calculateA({ a, g, N })).toBeDefined();
		expect(modPowSpy).toBeCalledWith(a, N, expect.any(Function));
	});

	it('should throw an error if modPow fails', async () => {
		modPowSpy.mockImplementation((_: any, __: any, callback: any) => {
			callback(new Error());
		});

		await expect(calculateA({ a, g, N })).rejects.toThrow();
	});

	it('should throw an error if A mod N equals BigInteger.ZERO', async () => {
		modPowSpy.mockImplementation((_: any, __: any, callback: any) => {
			callback(null, BigInteger.ZERO);
		});

		await expect(calculateA({ a, g, N })).rejects.toThrow('Illegal parameter');
	});
});
