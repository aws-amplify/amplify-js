// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-js';

/**
 * Standard HKDF algorithm.
 *
 * @param {Uint8Array} ikm Input key material.
 * @param {Uint8Array} salt Salt value.
 * @param {Uint8Array} info Context and application specific info.
 *
 * @returns {Uint8Array} Strong key material.
 *
 * @internal
 */
export const getHkdfKey = (
	ikm: Uint8Array,
	salt: Uint8Array,
	info: Uint8Array,
): Uint8Array => {
	const awsCryptoHash = new Sha256(salt);
	awsCryptoHash.update(ikm);

	const resultFromAWSCryptoPrk = awsCryptoHash.digestSync();
	const awsCryptoHashHmac = new Sha256(resultFromAWSCryptoPrk);
	awsCryptoHashHmac.update(info);

	const resultFromAWSCryptoHmac = awsCryptoHashHmac.digestSync();
	const hashHexFromAWSCrypto = resultFromAWSCryptoHmac;

	return hashHexFromAWSCrypto.slice(0, 16);
};
