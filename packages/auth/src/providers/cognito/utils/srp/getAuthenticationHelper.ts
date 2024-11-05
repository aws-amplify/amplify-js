// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthenticationHelper } from './AuthenticationHelper';
import { AuthBigInteger, BigInteger } from './BigInteger';
import { calculateA } from './calculate';
import { INIT_N } from './constants';
import { getHexFromBytes } from './getHexFromBytes';
import { getRandomBytes } from './getRandomBytes';

/**
 * Returns a new {@link AuthenticationHelper} instance with randomly generated BigInteger seed
 *
 * @param userPoolName Cognito user pool name.
 * @returns An {@link AuthenticationHelper} instance.
 *
 * @internal
 */
export const getAuthenticationHelper = async (userPoolName: string) => {
	const N = new BigInteger(INIT_N, 16);
	const g = new BigInteger('2', 16);
	const a = generateRandomBigInteger();
	const A = await calculateA({ a, g, N });

	return new AuthenticationHelper({ userPoolName, a, g, A, N });
};

/**
 * Generates a random BigInteger.
 *
 * @returns {BigInteger} a random value.
 */
const generateRandomBigInteger = (): AuthBigInteger => {
	// This will be interpreted as a postive 128-bit integer
	const hexRandom = getHexFromBytes(getRandomBytes(128));

	// There is no need to do randomBigInt.mod(this.N - 1) as N (3072-bit) is > 128 bytes (1024-bit)
	return new BigInteger(hexRandom, 16);
};
