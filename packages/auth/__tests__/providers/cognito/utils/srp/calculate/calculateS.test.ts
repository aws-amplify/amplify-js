// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BigInteger } from '../../../../../../src/providers/cognito/utils/srp/BigInteger';
import { calculateS } from '../../../../../../src/providers/cognito/utils/srp/calculate';

describe('calculateS', () => {
	const a = new BigInteger('a', 16);
	const g = new BigInteger('g', 16);
	const k = new BigInteger('k', 16);
	const x = new BigInteger('x', 16);
	const B = new BigInteger('B', 16);
	const N = new BigInteger('N', 16);
	const U = new BigInteger('U', 16);
	// create spies
	const modPowSpy = jest.spyOn(BigInteger.prototype, 'modPow');

	afterEach(() => {
		modPowSpy.mockReset();
	});

	it('calculates S', async () => {
		expect(
			await calculateS({
				a,
				g,
				k,
				x,
				B,
				N,
				U,
			}),
		).toBeDefined();
		expect(modPowSpy).toHaveBeenCalledWith(x, N, expect.any(Function));
	});

	it('should throw an error if outer modPow fails', async () => {
		modPowSpy.mockImplementationOnce((_: any, __: any, callback: any) => {
			callback(new Error());
		});

		await expect(
			calculateS({
				a,
				g,
				k,
				x,
				B,
				N,
				U,
			}),
		).rejects.toThrow();
	});

	it('should throw an error if inner modPow fails', async () => {
		modPowSpy
			.mockImplementationOnce((_: any, __: any, callback: any) => {
				callback(null, new BigInteger('outer-result', 16));
			})
			.mockImplementationOnce((_: any, __: any, callback: any) => {
				callback(new Error());
			});

		await expect(
			calculateS({
				a,
				g,
				k,
				x,
				B,
				N,
				U,
			}),
		).rejects.toThrow();
	});
});
