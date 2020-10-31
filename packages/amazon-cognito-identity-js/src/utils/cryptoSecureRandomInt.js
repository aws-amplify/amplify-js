var crypto;

// Native crypto from window (Browser)
if (typeof window !== 'undefined' && window.crypto) {
	crypto = window.crypto;
}

// Native (experimental IE 11) crypto from window (Browser)
if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
	crypto = window.msCrypto;
}

// Native crypto from global (NodeJS)
if (!crypto && typeof global !== 'undefined' && global.crypto) {
	crypto = global.crypto;
}

/*
 * Cryptographically secure pseudorandom number generator
 * As Math.random() is cryptographically not safe to use
 */
export default function cryptoSecureRandomInt() {
	if (crypto && typeof crypto.getRandomValues === 'function') {
		try {
			return crypto.getRandomValues(new Uint32Array(1))[0];
		} catch (err) {}
	}

	throw new Error(
		'Native crypto module could not be used to get secure random number.'
	);
}
