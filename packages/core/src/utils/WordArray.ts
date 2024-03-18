// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cryptoSecureRandomInt } from './cryptoSecureRandomInt';

/**
 * Hex encoding strategy.
 * Converts a word array to a hex string.
 * @param {WordArray} wordArray The word array.
 * @return {string} The hex string.
 * @static
 */
function hexStringify(wordArray: WordArray): string {
	// Shortcuts
	const { words } = wordArray;
	const { sigBytes } = wordArray;

	// Convert
	const hexChars: string[] = [];
	for (let i = 0; i < sigBytes; i++) {
		const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		hexChars.push((bite >>> 4).toString(16));
		hexChars.push((bite & 0x0f).toString(16));
	}

	return hexChars.join('');
}

export class WordArray {
	words: number[] = [];
	sigBytes: number;

	constructor(words?: number[], sigBytes?: number) {
		let Words = words;
		Words = this.words = Words || [];

		if (sigBytes !== undefined) {
			this.sigBytes = sigBytes;
		} else {
			this.sigBytes = Words.length * 4;
		}
	}

	random(nBytes: number): WordArray {
		const words: number[] = [];

		for (let i = 0; i < nBytes; i += 4) {
			words.push(cryptoSecureRandomInt());
		}

		return new WordArray(words, nBytes);
	}

	toString(): string {
		return hexStringify(this);
	}
}
