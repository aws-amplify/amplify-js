// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { computeS } from '@aws-amplify/react-native';
import AuthenticationHelper from './AuthenticationHelper';
import { BigIntegerInterface } from '../BigInteger/types';
import { BigInteger } from '../BigInteger';

AuthenticationHelper.prototype.calculateS = function calculateS(
	xValue: BigIntegerInterface,
	serverBValue: BigIntegerInterface,
	callback: Function
) {
	computeS({
		g: (this as unknown as AuthenticationHelper).g.toString(16),
		x: xValue.toString(16),
		k: (this as unknown as AuthenticationHelper).k.toString(16),
		a: (this as unknown as AuthenticationHelper).smallAValue.toString(16),
		b: serverBValue.toString(16),
		u: (this as unknown as AuthenticationHelper).getUValue().toString(16),
	})
		.then(result => callback(null, new BigInteger(result, 16)))
		.catch(error => callback(new Error(error), null));
};

export { AuthenticationHelper };
