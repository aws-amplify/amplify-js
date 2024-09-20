// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageUploadDataPayload } from '../../../types';
import { getDataChunker } from '../apis/uploadData/multipart/getDataChunker';

import { calculateContentCRC32 } from './crc32';

export const getCombinedCrc32 = async (
	data: StorageUploadDataPayload,
	size: number | undefined,
) => {
	const crc32List: ArrayBuffer[] = [];
	const dataChunker = getDataChunker(data, size);
	for (const { data: checkData } of dataChunker) {
		const { checksumArrayBuffer } = await calculateContentCRC32(checkData);

		crc32List.push(checksumArrayBuffer);
	}

	return `${(await calculateContentCRC32(new Blob(crc32List))).checksum}-${crc32List.length}`;
};
