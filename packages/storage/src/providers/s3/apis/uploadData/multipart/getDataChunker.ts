// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageUploadDataPayload } from '../../../../../types';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../errors/types/validation';
import { StorageError } from '../../../../../errors/StorageError';
import { calculatePartSize } from './calculatePartSize';

export type PartToUpload = {
	partNumber: number;
	data: Blob | ArrayBuffer | string;
	size: number;
};

export const getDataChunker = (
	data: StorageUploadDataPayload,
	totalSize?: number
): Generator<PartToUpload, void, undefined> => {
	const partSize = calculatePartSize(totalSize);

	if (data instanceof Blob) {
		return helper(data, 0, data.size, partSize);
	} else if (ArrayBuffer.isView(data)) {
		return helper(data.buffer, data.byteOffset, data.byteLength, partSize);
	} else if (data instanceof ArrayBuffer) {
		return helper(data, 0, data.byteLength, partSize);
	} else if (typeof data === 'string') {
		const blob = new Blob([data]);
		return getDataChunker(blob, blob.size);
	} else {
		throw new StorageError({
			name: StorageValidationErrorCode.InvalidUploadSource,
			...validationErrorMap[StorageValidationErrorCode.InvalidUploadSource],
		});
	}
};

const helper = function* (
	buffer: ArrayBuffer | Blob,
	byteOffset: number,
	byteLength: number,
	partSize: number
): Generator<PartToUpload, void, undefined> {
	let partNumber = 1;
	let startByte = byteOffset;
	let endByte = byteOffset + Math.min(partSize, byteLength);

	while (endByte < byteLength + byteOffset) {
		yield {
			partNumber,
			data: buffer.slice(startByte, endByte),
			size: partSize,
		};
		partNumber += 1;
		startByte = endByte;
		endByte = startByte + partSize;
	}

	yield {
		partNumber,
		data: buffer.slice(startByte, byteLength + byteOffset),
		size: byteLength + byteOffset - startByte,
	};
};
