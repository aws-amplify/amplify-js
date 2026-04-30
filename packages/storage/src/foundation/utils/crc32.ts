// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import crc32 from 'crc-32';

import { hexToBase64 } from '../../providers/s3/utils/hexUtils';
import { ReadFile } from '../types';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

/**
 * Calculate the CRC32 checksum for given content and return base64 encoded
 * checksum. The `readFile` dependency is injected so that the foundation
 * layer stays free of environment-specific logic (see {@link ReadFile}).
 */
export const calculateContentCRC32 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	readFile: ReadFile,
	seed = 0,
): Promise<string> => {
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

	return hexToBase64(hex);
};
