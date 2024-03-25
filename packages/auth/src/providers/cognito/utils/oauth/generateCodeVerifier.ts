// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-js';
import { base64Encoder, getCrypto } from '@aws-amplify/core/internals/utils';

const CODE_VERIFIER_CHARSET =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 *
 * @param length Desired length of the code verifier.
 *
 * **NOTE:** According to the [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 * A code verifier must be with a length >= 43 and <= 128.
 *
 * @returns An object that contains the generated `codeVerifier` and a method
 * `toCodeChallenge` to generate the code challenge from the `codeVerifier`
 * following the spec of [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2).
 */
export const generateCodeVerifier = (
	length: number,
): {
	value: string;
	method: 'S256';
	toCodeChallenge(): string;
} => {
	const randomBytes = new Uint8Array(length);
	getCrypto().getRandomValues(randomBytes);

	let value = '';
	let codeChallenge: string | undefined;

	for (const byte of randomBytes) {
		value += CODE_VERIFIER_CHARSET.charAt(byte % CODE_VERIFIER_CHARSET.length);
	}

	return {
		value,
		method: 'S256',
		toCodeChallenge() {
			if (codeChallenge) {
				return codeChallenge;
			}
			codeChallenge = generateCodeChallenge(value);

			return codeChallenge;
		},
	};
};

function generateCodeChallenge(codeVerifier: string): string {
	const awsCryptoHash = new Sha256();
	awsCryptoHash.update(codeVerifier);

	const codeChallenge = removePaddingChar(
		base64Encoder.convert(awsCryptoHash.digestSync(), { urlSafe: true }),
	);

	return codeChallenge;
}

function removePaddingChar(base64Encoded: string): string {
	return base64Encoded.replace(/=/g, '');
}
