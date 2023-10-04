// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthBigInteger, BigInteger } from '../BigInteger';

/**
 * @internal
 */
export const calculateA = async ({
	a,
	g,
	N,
}: {
	a: AuthBigInteger;
	g: AuthBigInteger;
	N: AuthBigInteger;
}): Promise<AuthBigInteger> => {
	return new Promise((resolve, reject) => {
		g.modPow(a, N, (err: unknown, A: AuthBigInteger) => {
			if (err) {
				reject(err);
				return;
			}

			if (A.mod(N).equals(BigInteger.ZERO)) {
				reject(new Error('Illegal parameter. A mod N cannot be 0.'));
				return;
			}

			resolve(A);
		});
	});
};
