// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const getCrypto = () => {
	let crypto: any;

	if (typeof window !== 'undefined' && window.crypto) {
		// Native crypto from window (Browser)
		crypto = window.crypto;
	} else if (typeof global !== 'undefined' && (global as any).crypto) {
		// Native crypto from global (Node)
		crypto = (global as any).crypto;
	} else if (!crypto && typeof require === 'function') {
		// Native crypto import via require (NodeJS)
		try {
			crypto = require('crypto');
		} catch (err) {}
	}

	return crypto;
};

/*
 * Cryptographically secure pseudorandom number generator
 * As Math.random() is cryptographically not safe to use
 */
export default function cryptoSecureRandomInt() {
	const crypto = getCrypto();

	if (crypto) {
		// Use getRandomValues method (Browser)
		if (typeof crypto.getRandomValues === 'function') {
			try {
				const randomResult = crypto.getRandomValues(new Uint32Array(1))[0];
				return randomResult;
			} catch (err) {}
		}

		// Use randomBytes method (NodeJS)
		if (typeof crypto.randomBytes === 'function') {
			try {
				return crypto.randomBytes(4).readInt32LE();
			} catch (err) {}
		}
	}

	throw new Error(
		'Native crypto module could not be used to get secure random number.'
	);
}
