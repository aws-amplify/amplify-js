// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { computeS } from '@aws-amplify/react-native';
import { AuthBigInteger, BigInteger } from '../BigInteger';

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
	const result = await computeS({
		a: a.toString(16),
		g: g.toString(16),
		k: k.toString(16),
		x: x.toString(16),
		b: B.toString(16),
		u: U.toString(16),
	});
	return new BigInteger(result, 16);
};
