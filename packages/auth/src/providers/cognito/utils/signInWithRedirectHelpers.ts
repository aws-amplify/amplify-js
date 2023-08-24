import { Sha256 } from '@aws-crypto/sha256-js';

export function bufferToString(buffer: Uint8Array) {
	const CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const state = [];
	for (let i = 0; i < buffer.byteLength; i += 1) {
		const index = buffer[i] % CHARSET.length;
		state.push(CHARSET[index]);
	}
	return state.join('');
}

export function generateRandom(size: number) {
	``;
	const CHARSET =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	const buffer = new Uint8Array(size);
	if (typeof window !== 'undefined' && !!window.crypto) {
		window.crypto.getRandomValues(buffer);
	} else {
		for (let i = 0; i < size; i += 1) {
			buffer[i] = (Math.random() * CHARSET.length) | 0;
		}
	}

	return bufferToString(buffer);
}

export function generateState(length: number): string {
	let result = '';
	let i = length;
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for (; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

export function generateChallenge(code: string): string {
	const awsCryptoHash = new Sha256();
	awsCryptoHash.update(code);

	const resultFromAWSCrypto = awsCryptoHash.digestSync();

	const b64Frombtoa = base64URL(bytesToBase64(resultFromAWSCrypto));

	return b64Frombtoa;
}

export function base64URL(string): string {
	return string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function bytesToBase64(bytes: Uint8Array) {
	const binString = Array.from(bytes, x => String.fromCodePoint(x)).join('');
	return btoa(binString);
}
