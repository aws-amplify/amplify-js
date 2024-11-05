// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getBytesFromHex } from './getBytesFromHex';
import { getHashFromData } from './getHashFromData';

/**
 * Calculate a hash from a hex string
 * @param {string} hexStr Value to hash.
 * @returns {string} Hex-encoded hash.
 * @private
 */
export const getHashFromHex = (hexStr: string): string =>
	getHashFromData(getBytesFromHex(hexStr));
