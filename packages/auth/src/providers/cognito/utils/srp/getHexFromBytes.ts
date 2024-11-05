// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SHORT_TO_HEX } from './constants';

/**
 * Converts a Uint8Array of binary data to a hexadecimal encoded string.
 *
 * @param bytes The binary data to encode
 */
export const getHexFromBytes = (bytes: Uint8Array): string => {
	let out = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		out += SHORT_TO_HEX[bytes[i]];
	}

	return out;
};
