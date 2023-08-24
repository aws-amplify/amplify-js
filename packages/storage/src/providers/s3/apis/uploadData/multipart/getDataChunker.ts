// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UploadSource } from '../../../../../types';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../errors/types/validation';
import { StorageError } from '../../../../../errors/StorageError';
import { calculatePartSize } from './calculatePartSize';

export const getDataChunker = (data: UploadSource, totalSize?: number) => {
	const partSize = calculatePartSize(totalSize);

	if (data instanceof Blob) {
		return getBlobDataChunker(data, partSize);
	} else if (isArrayBufferView(data)) {
		return getArrayBufferViewChunker(
			data.buffer,
			data.byteOffset,
			data.byteLength,
			partSize
		);
	} else if (data instanceof ArrayBuffer) {
		return getArrayBufferViewChunker(data, 0, data.byteLength, partSize);
	} else if (typeof data === 'string') {
		return getStringDataChunker(data, partSize);
	} else {
		throw new StorageError({
			name: StorageValidationErrorCode.InvalidUploadSource,
			...validationErrorMap[StorageValidationErrorCode.InvalidUploadSource],
		});
	}
};

const isArrayBufferView = (input: any): input is ArrayBufferView =>
	input?.['buffer'] && input?.['byteOffset'] && input?.['byteLength'];

export type PartToUpload = {
	partNumber: number;
	data: Blob | ArrayBuffer | string;
	lastPart?: boolean;
};

const getBlobDataChunker = function* (
	blob: Blob,
	partSize: number
): Generator<PartToUpload, void, undefined> {
	let partNumber = 1;
	let startByte = 0;
	let endByte = Math.min(partSize, blob.size);

	while (endByte < blob.size) {
		yield {
			partNumber,
			data: blob.slice(startByte, endByte),
		};
		partNumber += 1;
		startByte = endByte;
		endByte = startByte + partSize;
	}

	yield {
		partNumber,
		data: blob.slice(startByte),
		lastPart: true,
	};
};

const getArrayBufferViewChunker = function* (
	buffer: ArrayBuffer,
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
		};
		partNumber += 1;
		startByte = endByte;
		endByte = startByte + partSize;
	}

	yield {
		partNumber,
		data: buffer.slice(startByte, byteLength + byteOffset),
		lastPart: true,
	};
};

const getStringDataChunker = function* (
	str: string,
	partSize: number
): Generator<PartToUpload, void, undefined> {
	let partNumber = 1;
	let startByte = 0;
	let endByte = Math.min(partSize, str.length);

	while (endByte < str.length) {
		yield {
			partNumber,
			data: str.slice(startByte, endByte),
		};
		partNumber += 1;
		startByte = endByte;
		endByte = startByte + partSize;
	}

	yield {
		partNumber,
		data: str.slice(startByte),
		lastPart: true,
	};
};
