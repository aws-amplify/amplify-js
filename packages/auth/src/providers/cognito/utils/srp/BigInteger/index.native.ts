// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { computeModPow } from '@aws-amplify/react-native';

import BigInteger from './BigInteger';
import { AuthBigInteger } from './types';

BigInteger.prototype.modPow = function modPow(
	e: AuthBigInteger,
	m: AuthBigInteger,
	callback: Function
) {
	computeModPow({
		base: (this as unknown as AuthBigInteger).toString(16),
		exponent: e.toString(16),
		divisor: m.toString(16),
	})
		.then((result: any) => callback(null, new BigInteger(result, 16)))
		.catch((error: any) => callback(new Error(error), null));
};

export { BigInteger };
