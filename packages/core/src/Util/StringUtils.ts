// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
const byteToHex = (byte: number) => byte.toString(16).padStart(2, '0');

/**
 * Encodes a string as a hexadecimal representation of its UTF-8 bytes.
 *
 * The UTF-8 encoding is performed manually rather than with `TextEncoder` so
 * the helper behaves identically in every runtime supported by v5, including
 * React Native environments that do not provide `TextEncoder`/`TextDecoder`.
 *
 * The output contains only the characters `[0-9a-f]`, which keeps it safe to
 * embed in the OAuth `state` parameter and leaves the `state.split('-')`
 * reconstruction in `completeOAuthFlow` intact.
 *
 * Unlike the previous per-code-unit encoding, characters outside the Latin-1
 * range (e.g. Polish, Cyrillic, Greek, Arabic, CJK, emoji) are encoded as
 * their UTF-8 bytes and survive a `urlSafeDecode` round trip unchanged.
 */
export function urlSafeEncode(str: string) {
	const hexChars: string[] = [];

	// `for...of` iterates code points, so a surrogate pair is encoded as a
	// single 4-byte UTF-8 sequence instead of two broken code units.
	for (const char of str) {
		const codePoint = char.codePointAt(0) || 0;

		if (codePoint < 0x80) {
			hexChars.push(byteToHex(codePoint));
		} else if (codePoint < 0x800) {
			hexChars.push(
				byteToHex(0xc0 | (codePoint >> 6)),
				byteToHex(0x80 | (codePoint & 0x3f))
			);
		} else if (codePoint < 0x10000) {
			hexChars.push(
				byteToHex(0xe0 | (codePoint >> 12)),
				byteToHex(0x80 | ((codePoint >> 6) & 0x3f)),
				byteToHex(0x80 | (codePoint & 0x3f))
			);
		} else {
			hexChars.push(
				byteToHex(0xf0 | (codePoint >> 18)),
				byteToHex(0x80 | ((codePoint >> 12) & 0x3f)),
				byteToHex(0x80 | ((codePoint >> 6) & 0x3f)),
				byteToHex(0x80 | (codePoint & 0x3f))
			);
		}
	}

	return hexChars.join('');
}

/**
 * Returns the inclusive range of values the second byte of a multi-byte UTF-8
 * sequence may take for the given lead byte, or `undefined` when the lead byte
 * cannot start a sequence (`0x80`-`0xc1` are always invalid, as `0xc0`/`0xc1`
 * could only ever produce overlong encodings).
 */
const secondByteRangeFor = (leadByte: number): [number, number] | undefined => {
	if (leadByte >= 0xc2 && leadByte <= 0xdf) {
		return [0x80, 0xbf];
	}
	if (leadByte === 0xe0) {
		return [0xa0, 0xbf]; // excludes 3-byte overlong encodings
	}
	if (leadByte >= 0xe1 && leadByte <= 0xec) {
		return [0x80, 0xbf];
	}
	if (leadByte === 0xed) {
		return [0x80, 0x9f]; // excludes UTF-16 surrogate code points
	}
	if (leadByte >= 0xee && leadByte <= 0xef) {
		return [0x80, 0xbf];
	}
	if (leadByte === 0xf0) {
		return [0x90, 0xbf]; // excludes 4-byte overlong encodings
	}
	if (leadByte >= 0xf1 && leadByte <= 0xf3) {
		return [0x80, 0xbf];
	}
	if (leadByte === 0xf4) {
		return [0x80, 0x8f]; // excludes code points above U+10FFFF
	}

	return undefined;
};

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */

/**
 * Decodes a hexadecimal string (as produced by {@link urlSafeEncode}) back to
 * the original string by interpreting the bytes as UTF-8.
 *
 * Byte sequences that are not valid UTF-8 (unknown lead byte, missing or
 * invalid continuation bytes, overlong encodings, truncated input) decode to
 * `U+FFFD` (the replacement character) rather than throwing, so corrupted or
 * tampered `state` values degrade the way `TextDecoder` does instead of
 * breaking the redirect flow. Hexadecimal produced by earlier library versions
 * for ASCII-only state decodes unchanged.
 */
export function urlSafeDecode(hex: string) {
	const matchArr = hex.match(/.{2}/g) || [];
	const bytes = matchArr.map(char => parseInt(char, 16));
	const chars: string[] = [];

	let index = 0;
	while (index < bytes.length) {
		const leadByte = bytes[index];

		if (leadByte < 0x80) {
			chars.push(String.fromCharCode(leadByte));
			index += 1;
			continue;
		}

		let sequenceLength = 0;
		if (leadByte >= 0xc2 && leadByte <= 0xdf) {
			sequenceLength = 2;
		} else if (leadByte >= 0xe0 && leadByte <= 0xef) {
			sequenceLength = 3;
		} else if (leadByte >= 0xf0 && leadByte <= 0xf4) {
			sequenceLength = 4;
		}

		const secondByteRange = secondByteRangeFor(leadByte);
		const hasEnoughBytes = index + sequenceLength <= bytes.length;
		const secondByte =
			hasEnoughBytes && sequenceLength > 1 ? bytes[index + 1] : undefined;

		const isValid =
			secondByteRange !== undefined &&
			secondByte !== undefined &&
			secondByte >= secondByteRange[0] &&
			secondByte <= secondByteRange[1] &&
			// remaining continuation bytes must all be of the form `10xxxxxx`
			bytes
				.slice(index + 2, index + sequenceLength)
				.every(byte => (byte & 0xc0) === 0x80);

		if (!isValid) {
			chars.push('\uFFFD');
			index += 1;
			continue;
		}

		let codePoint = leadByte & ((1 << (7 - sequenceLength)) - 1);
		for (let offset = 1; offset < sequenceLength; offset++) {
			codePoint = (codePoint << 6) | (bytes[index + offset] & 0x3f);
		}

		chars.push(String.fromCodePoint(codePoint));
		index += sequenceLength;
	}

	return chars.join('');
}
