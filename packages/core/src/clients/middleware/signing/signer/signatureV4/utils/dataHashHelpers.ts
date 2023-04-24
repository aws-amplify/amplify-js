// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: V6 update to different crypto dependency?
import { Sha256 } from '@aws-crypto/sha256-js';
import { SourceData } from '@aws-sdk/types';
import { toHex } from '@aws-sdk/util-hex-encoding';

/**
 * Returns the hashed data a `Uint8Array`.
 *
 * @param key `SourceData` to be used as hashing key.
 * @param data Hashable `SourceData`.
 * @returns `Uint8Array` created from the data as input to a hash function.
 */
export const getHashedData = async (
	key: SourceData | null,
	data: SourceData
): Promise<Uint8Array> => {
	const sha256 = new Sha256(key);
	sha256.update(data);
	const hashedData = await sha256.digest();
	return hashedData;
};

/**
 * Returns the hashed data as a hex string.
 *
 * @param key `SourceData` to be used as hashing key.
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
