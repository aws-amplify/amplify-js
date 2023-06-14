// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getCrypto = () => {
	if (typeof window !== 'undefined' && window.crypto) {
		// Native crypto from window (Browser)
		return window.crypto;
	}

	throw new Error('Native crypto module was not found');
};

/*
 * Cryptographically secure pseudorandom number generator
 * As Math.random() is cryptographically not safe to use
 */
export default function cryptoSecureRandomInt() {
	const crypto = getCrypto();

	// Use getRandomValues method (Browser)
	if (typeof crypto.getRandomValues === 'function') {
		try {
			const randomResult = crypto.getRandomValues(new Uint32Array(1))[0];
			return randomResult;
		} catch (err) {}
	}

	throw new Error(
		'Native crypto module could not be used to get secure random number.'
	);
}
