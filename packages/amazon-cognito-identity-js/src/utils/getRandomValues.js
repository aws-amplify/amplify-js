let crypto = {};

// Native crypto from window (Browser)
if (typeof window !== 'undefined' && window.crypto) {
	crypto = window.crypto;
}

// Native (experimental IE 11) crypto from window (Browser)
if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
	crypto = window.msCrypto;
}

export default crypto.getRandomValues;
