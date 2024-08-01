// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

import { ResolvedS3Config } from '../../../types/options';
import { StorageUploadDataPayload } from '../../../../../types';
import { Part, createMultipartUpload } from '../../../utils/client/s3data';
import { logger } from '../../../../../utils';
import { calculateContentCRC32 } from '../../../utils/crc32';

import {
	cacheMultipartUpload,
	findCachedUploadParts,
	getUploadsCacheKey,
} from './uploadCache';
import { getDataChunker } from './getDataChunker';

interface LoadOrCreateMultipartUploadOptions {
	s3Config: ResolvedS3Config;
	data: StorageUploadDataPayload;
	bucket: string;
	accessLevel?: StorageAccessLevel;
	keyPrefix?: string;
	key: string;
	contentType?: string;
	contentDisposition?: string;
	contentEncoding?: string;
	metadata?: Record<string, string>;
	size?: number;
	abortSignal?: AbortSignal;
}

interface LoadOrCreateMultipartUploadResult {
	uploadId: string;
	cachedParts: Part[];
	finalCrc32?: string;
}

/**
 * Load the in-progress multipart upload from local storage or async storage(RN) if it exists, or create a new multipart
 * upload.
 *
 * @internal
 */
export const loadOrCreateMultipartUpload = async ({
	s3Config,
	data,
	size,
	contentType,
	bucket,
	accessLevel,
	keyPrefix,
	key,
	contentDisposition,
	contentEncoding,
	metadata,
	abortSignal,
}: LoadOrCreateMultipartUploadOptions): Promise<LoadOrCreateMultipartUploadResult> => {
	const finalKey = keyPrefix !== undefined ? keyPrefix + key : key;

	let cachedUpload:
		| {
				parts: Part[];
				uploadId: string;
				uploadCacheKey: string;
				finalCrc32?: string;
		  }
		| undefined;
	if (size === undefined) {
		logger.debug('uploaded data size cannot be determined, skipping cache.');
		cachedUpload = undefined;
	} else {
		const uploadCacheKey = getUploadsCacheKey({
			size,
			contentType,
			file: data instanceof File ? data : undefined,
			bucket,
			accessLevel,
			key,
		});

		const cachedUploadParts = await findCachedUploadParts({
			s3Config,
			cacheKey: uploadCacheKey,
			bucket,
			finalKey,
		});
		cachedUpload = cachedUploadParts
			? { ...cachedUploadParts, uploadCacheKey }
			: undefined;
	}

	if (cachedUpload) {
		return {
			uploadId: cachedUpload.uploadId,
			cachedParts: cachedUpload.parts,
			finalCrc32: cachedUpload.finalCrc32,
		};
	} else {
		const finalCrc32 = await getCombinedCrc32(data, size);

		const { UploadId } = await createMultipartUpload(
			{
				...s3Config,
				abortSignal,
			},
			{
				Bucket: bucket,
				Key: finalKey,
				ContentType: contentType,
				ContentDisposition: contentDisposition,
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ChecksumAlgorithm: finalCrc32 ? 'CRC32' : undefined,
			},
		);

		if (size === undefined) {
			logger.debug('uploaded data size cannot be determined, skipping cache.');

			return {
				uploadId: UploadId!,
				cachedParts: [],
				finalCrc32,
			};
		}
		const uploadCacheKey = getUploadsCacheKey({
			size,
			contentType,
			file: data instanceof File ? data : undefined,
			bucket,
			accessLevel,
			key,
		});
		await cacheMultipartUpload(uploadCacheKey, {
			uploadId: UploadId!,
			bucket,
			key,
			finalCrc32,
			fileName: data instanceof File ? data.name : '',
		});

		return {
			uploadId: UploadId!,
			cachedParts: [],
			finalCrc32,
		};
	}
};

const getCombinedCrc32 = async (
	data: StorageUploadDataPayload,
	size: number | undefined,
) => {
	const crc32List: ArrayBuffer[] = [];
	const dataChunker = getDataChunker(data, size);
	for (const { data: checkData } of dataChunker) {
		const checksumArrayBuffer = (await calculateContentCRC32(checkData))
			?.checksumArrayBuffer;
		if (checksumArrayBuffer === undefined) return undefined;

		crc32List.push(checksumArrayBuffer);
	}

	return `${(await calculateContentCRC32(new Blob(crc32List)))?.checksum}-${crc32List.length}`;
};
