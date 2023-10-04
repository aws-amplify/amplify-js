// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HEX_TO_SHORT } from './constants';

/**
 * Converts a hexadecimal encoded string to a Uint8Array of bytes.
 *
 * @param encoded The hexadecimal encoded string
 */
export const getBytesFromHex = (encoded: string): Uint8Array => {
	if (encoded.length % 2 !== 0) {
		throw new Error('Hex encoded strings must have an even number length');
	}

	const out = new Uint8Array(encoded.length / 2);
	for (let i = 0; i < encoded.length; i += 2) {
		const encodedByte = encoded.slice(i, i + 2).toLowerCase();
		if (encodedByte in HEX_TO_SHORT) {
			out[i / 2] = HEX_TO_SHORT[encodedByte];
		} else {
			throw new Error(
				`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`
			);
		}
	}

	return out;
};
