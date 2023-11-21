// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthBigInteger,
	BigInteger,
} from '~/src/providers/cognito/utils/srp/BigInteger';
import { getHashFromHex } from '~/src/providers/cognito/utils/srp/getHashFromHex';
import { getPaddedHex } from '~/src/providers/cognito/utils/srp/getPaddedHex';

/**
 * @internal
 */
export const calculateU = ({
	A,
	B,
}: {
	A: AuthBigInteger;
	B: AuthBigInteger;
}): AuthBigInteger => {
	const U = new BigInteger(
		getHashFromHex(getPaddedHex(A) + getPaddedHex(B)),
		16,
	);

	if (U.equals(BigInteger.ZERO)) {
		throw new Error('U cannot be zero.');
	}

	return U;
};
