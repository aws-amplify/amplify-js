// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getBytesFromHex } from './getBytesFromHex';
import { WordArray } from '@aws-amplify/core/internals/utils';

/**
 * Returns a Uint8Array with a sequence of random nBytes
 *
 * @param {number} nBytes
 * @returns {Uint8Array} fixed-length sequence of random bytes
 */
export const getRandomBytes = (nBytes: number): Uint8Array => {
	const str = new WordArray().random(nBytes).toString();

	return getBytesFromHex(str);
};
