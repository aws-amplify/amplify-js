// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import crc32 from 'crc-32';

export interface CRC32Checksum {
	checksumArrayBuffer: ArrayBuffer;
	checksum: string;
	seed: number;
}

export const calculateContentCRC32 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	seed = 0,
): Promise<CRC32Checksum | undefined> => {
	let internalSeed = seed;
	let blob: Blob;

	if (content instanceof Blob) {
		blob = content;
	} else {
		blob = new Blob([content]);
	}

	await blob.stream().pipeTo(
		new WritableStream<Uint8Array>({
			write(chunk) {
				internalSeed = crc32.buf(chunk, internalSeed) >>> 0;
			},
		}),
	);
	const hex = internalSeed.toString(16).padStart(8, '0');

	return {
		checksumArrayBuffer: hexToArrayBuffer(hex),
		checksum: hexToBase64(hex),
		seed: internalSeed,
	};
};

const hexToArrayBuffer = (hexString: string) =>
	new Uint8Array((hexString.match(/\w{2}/g)! ?? []).map(h => parseInt(h, 16)))
		.buffer;

const hexToBase64 = (hexString: string) =>
	btoa(
		hexString
			.match(/\w{2}/g)!
			.map((a: string) => String.fromCharCode(parseInt(a, 16)))
			.join(''),
	);
