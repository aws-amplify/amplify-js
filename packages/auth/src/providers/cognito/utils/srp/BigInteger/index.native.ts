// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { computeModPow } from '@aws-amplify/react-native';

import BigInteger from './BigInteger';
import { BigIntegerInterface } from './types';

BigInteger.prototype.modPow = function modPow(
	e: BigIntegerInterface,
	m: BigIntegerInterface,
	callback: Function
) {
	computeModPow({
		base: (this as unknown as BigIntegerInterface).toString(16),
		exponent: e.toString(16),
		divisor: m.toString(16),
	})
		.then(result => callback(null, new BigInteger(result, 16)))
		.catch(error => callback(new Error(error), null));
};

export { BigInteger };
