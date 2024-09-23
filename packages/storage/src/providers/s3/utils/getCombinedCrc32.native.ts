// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageUploadDataPayload } from '../../../types';
import { getDataChunker } from '../apis/uploadData/multipart/getDataChunker';

import { calculateContentCRC32 } from './crc32';

export const getCombinedCrc32 = async (
	data: StorageUploadDataPayload,
	size: number | undefined,
) => {
	const crc32List: Uint8Array[] = [];
	const dataChunker = getDataChunker(data, size);

	let totalLength = 0;
	for (const { data: checkData } of dataChunker) {
		const checksum = new Uint8Array(
			(await calculateContentCRC32(checkData)).checksumArrayBuffer,
		);
		totalLength += checksum.length;
		crc32List.push(checksum);
	}

	// Combine all Uint8Arrays into a single Uint8Array
	const combinedArray = new Uint8Array(totalLength);
	let offset = 0;
	for (const crc32Hash of crc32List) {
		combinedArray.set(crc32Hash, offset);
		offset += crc32Hash.length;
	}

	return `${(await calculateContentCRC32(combinedArray.buffer)).checksum}-${crc32List.length}`;
};
