import { AmplifyError } from '../Errors';

export function cryptoSecureRandomInt(): number {
	if (typeof window.crypto.getRandomValues === 'function') {
		try {
			return crypto.getRandomValues(new Uint32Array(1))[0];
		} catch (err) {
			throw new AmplifyError({
				name: 'MissingCryptoError',
				message: 'window.crypto is not available on this browser',
				recoverySuggestion: 'Polyfill window.crypto with another library',
			});
		}
	} else {
		throw new AmplifyError({
			name: 'MissingCryptoError',
			message: 'window.crypto is not available on this browser',
			recoverySuggestion: 'Polyfill window.crypto with another library',
		});
	}
}
