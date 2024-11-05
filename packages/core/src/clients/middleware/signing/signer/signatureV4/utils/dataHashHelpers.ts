// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: V6 update to different crypto dependency?
import { Sha256 } from '@aws-crypto/sha256-js';
import { SourceData } from '@aws-sdk/types';
import { toHex } from '@smithy/util-hex-encoding';

/**
 * Returns the hashed data a `Uint8Array`.
 *
 * @param key `SourceData` to be used as hashing key.
 * @param data Hashable `SourceData`.
 * @returns `Uint8Array` created from the data as input to a hash function.
 */
export const getHashedData = (
	key: SourceData | null,
	data: SourceData,
): Uint8Array => {
	const sha256 = new Sha256(key ?? undefined);
	sha256.update(data);
	// TODO: V6 flip to async digest
	const hashedData = sha256.digestSync();

	return hashedData;
};

/**
 * Returns the hashed data as a hex string.
 *
 * @param key `SourceData` to be used as hashing key.
 * @param data Hashable `SourceData`.
 * @returns String using lowercase hexadecimal characters created from the data as input to a hash function.
 *
 * @internal
 */
export const getHashedDataAsHex = (
	key: SourceData | null,
	data: SourceData,
): string => {
	const hashedData = getHashedData(key, data);

	return toHex(hashedData);
};
