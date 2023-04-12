// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: V6 update to different crypto dependency?
import { Sha256 } from '@aws-crypto/sha256-js';
import { SourceData } from '@aws-sdk/types';
import { fromString } from '@aws-sdk/util-buffer-from';
import { toHex } from '@aws-sdk/util-hex-encoding';

/**
 * Returns the hashed data a `Uint8Array`.
 *
 * @param data Hashable `SourceData`.
 * @returns `Uint8Array` created from the data as input to a hash function.
 */
export const getHashedData = async (
	key: SourceData | null,
	data: SourceData
): Promise<Uint8Array> => {
	const sha256 = new Sha256(key);
	sha256.update(toUint8Array(data));
	const hashedData = await sha256.digest();
	return hashedData;
};

/**
 * Returns the hashed data as a hex string.
 *
 * @param data Hashable `SourceData`.
 * @returns String using lowercase hexadecimal characters created from the data as input to a hash function.
 */
export const getHashedDataAsHex = async (
	key: SourceData | null,
	data: SourceData
): Promise<string> => {
	const hashedData = await getHashedData(key, data);
	return toHex(hashedData);
};

const isString = (body: SourceData): body is string => typeof body === 'string';

const toUint8Array = (body: SourceData): Uint8Array => {
	if (isString(body) || ArrayBuffer.isView(body)) {
		const buf = isString(body) ? fromString(body, 'utf8') : body;
		return new Uint8Array(
			buf.buffer,
			buf.byteOffset,
			buf.byteLength / Uint8Array.BYTES_PER_ELEMENT
		);
	}
	return new Uint8Array(body);
};
