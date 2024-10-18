// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import crc32 from 'crc-32';

import { hexToArrayBuffer, hexToBase64 } from './hexUtils';

export interface CRC32Checksum {
	checksumArrayBuffer: ArrayBuffer;
	checksum: string;
	seed: number;
}

export const calculateContentCRC32 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	seed = 0,
): Promise<CRC32Checksum> => {
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
