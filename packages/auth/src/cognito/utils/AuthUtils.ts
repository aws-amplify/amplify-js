import WordArray from './WordArray';
import { Sha256 } from '@aws-crypto/sha256-js';

export function randomBytes(nBytes) {
	return new WordArray().random(nBytes).toString();
}

export function hash(buf) {
	const awsCryptoHash = new Sha256();
	awsCryptoHash.update(buf);

	const resultFromAWSCrypto = awsCryptoHash.digestSync();
	const hashHexFromUint8 = toHex(resultFromAWSCrypto);
	return new Array(64 - hashHexFromUint8.length).join('0') + hashHexFromUint8;
}

/**
 * Calculate a hash from a hex string
 * @param {String} hexStr Value to hash.
 * @returns {String} Hex-encoded hash.
 * @private
 */
export function hexHash(hexStr) {
	return hash(fromHex(hexStr));
}

const SHORT_TO_HEX = {};
const HEX_TO_SHORT = {};

for (let i = 0; i < 256; i++) {
	let encodedByte = i.toString(16).toLowerCase();
	if (encodedByte.length === 1) {
		encodedByte = `0${encodedByte}`;
	}

	SHORT_TO_HEX[i] = encodedByte;
	HEX_TO_SHORT[encodedByte] = i;
}

/**
 * Converts a hexadecimal encoded string to a Uint8Array of bytes.
 *
 * @param encoded The hexadecimal encoded string
 */
function fromHex(encoded) {
	if (encoded.length % 2 !== 0) {
		throw new Error('Hex encoded strings must have an even number length');
	}

	const out = new Uint8Array(encoded.length / 2);
	for (let i = 0; i < encoded.length; i += 2) {
		const encodedByte = encoded.slice(i, i + 2).toLowerCase();
		if (encodedByte in HEX_TO_SHORT) {
			out[i / 2] = HEX_TO_SHORT[encodedByte];
		} else {
			throw new Error(
				`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`
			);
		}
	}

	return out;
}

/**
 * Converts a Uint8Array of binary data to a hexadecimal encoded string.
 *
 * @param bytes The binary data to encode
 */
export function toHex(bytes) {
	let out = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		out += SHORT_TO_HEX[bytes[i]];
	}

	return out;
}

export function _urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function _encodeBase64Bytes(bytes) {
	return window.btoa(
		bytes.reduce((acc, current) => acc + String.fromCharCode(current), '')
	);
}

const monthNames = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];
const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getNowString() {
	const now = new Date();

	const weekDay = weekNames[now.getUTCDay()];
	const month = monthNames[now.getUTCMonth()];
	const day = now.getUTCDate();

	let hours: string | number = now.getUTCHours();
	if (hours < 10) {
		hours = `0${hours}`;
	}

	let minutes: string | number = now.getUTCMinutes();
	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	let seconds: string | number = now.getUTCSeconds();
	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	const year = now.getUTCFullYear();

	// ddd MMM D HH:mm:ss UTC YYYY
	const dateNow = `${weekDay} ${month} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`;

	return dateNow;
}
