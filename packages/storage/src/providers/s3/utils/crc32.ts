// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import crc32 from 'crc-32';

import { hexToArrayBuffer, hexToBase64 } from './hexUtils';
import { readFile } from './readFile';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

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

	if (content instanceof ArrayBuffer || ArrayBuffer.isView(content)) {
		let uint8Array: Uint8Array;

		if (content instanceof ArrayBuffer) {
			uint8Array = new Uint8Array(content);
		} else {
			uint8Array = new Uint8Array(
				content.buffer,
				content.byteOffset,
				content.byteLength,
			);
		}

		let offset = 0;
		while (offset < uint8Array.length) {
			const end = Math.min(offset + CHUNK_SIZE, uint8Array.length);
			const chunk = uint8Array.slice(offset, end);
			internalSeed = crc32.buf(chunk, internalSeed) >>> 0;
			offset = end;
		}
	} else {
		let blob: Blob;

		if (content instanceof Blob) {
			blob = content;
		} else {
			blob = new Blob([content]);
		}

		let offset = 0;
		while (offset < blob.size) {
			const end = Math.min(offset + CHUNK_SIZE, blob.size);
			const chunk = blob.slice(offset, end);
			const arrayBuffer = await readFile(chunk);
			const uint8Array = new Uint8Array(arrayBuffer);

			internalSeed = crc32.buf(uint8Array, internalSeed) >>> 0;

			offset = end;
		}
	}

	const hex = internalSeed.toString(16).padStart(8, '0');

	return {
		checksumArrayBuffer: hexToArrayBuffer(hex),
		checksum: hexToBase64(hex),
		seed: internalSeed,
	};
};
