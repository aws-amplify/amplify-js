// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthBigInteger } from '../BigInteger';

/**
 * @internal
 */
export const calculateS = async ({
	a,
	g,
	k,
	x,
	B,
	N,
	U,
}: {
	a: AuthBigInteger;
	g: AuthBigInteger;
	k: AuthBigInteger;
	x: AuthBigInteger;
	B: AuthBigInteger;
	N: AuthBigInteger;
	U: AuthBigInteger;
}): Promise<AuthBigInteger> => {
	return new Promise((resolve, reject) => {
		g.modPow(x, N, (outerErr: unknown, outerResult: AuthBigInteger) => {
			if (outerErr) {
				reject(outerErr);
				return;
			}

			B.subtract(k.multiply(outerResult)).modPow(
				a.add(U.multiply(x)),
				N,
				(innerErr: unknown, innerResult: AuthBigInteger) => {
					if (innerErr) {
						reject(innerErr);
						return;
					}
					resolve(innerResult.mod(N));
				}
			);
		});
	});
};
