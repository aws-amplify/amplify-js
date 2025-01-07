// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	StorageAccessLevel,
} from '@aws-amplify/core';

import {
	ContentDisposition,
	ResolvedS3Config,
	UploadDataChecksumAlgorithm,
} from '../../../../types/options';
import { StorageUploadDataPayload } from '../../../../../../types';
import { Part, createMultipartUpload } from '../../../../utils/client/s3data';
import { logger } from '../../../../../../utils';
import { constructContentDisposition } from '../../../../utils/constructContentDisposition';
import { CHECKSUM_ALGORITHM_CRC32 } from '../../../../utils/constants';
import { getCombinedCrc32 } from '../../../../utils/getCombinedCrc32.native';

import {
	cacheMultipartUpload,
	findCachedUploadParts,
	getUploadsCacheKey,
} from './uploadCache';

interface LoadOrCreateMultipartUploadOptions {
	s3Config: ResolvedS3Config;
	data: StorageUploadDataPayload;
	bucket: string;
	size: number;
	accessLevel?: StorageAccessLevel;
	keyPrefix?: string;
	key: string;
	contentType?: string;
	contentDisposition?: string | ContentDisposition;
	contentEncoding?: string;
	metadata?: Record<string, string>;
	abortSignal?: AbortSignal;
	checksumAlgorithm?: UploadDataChecksumAlgorithm;
	optionsHash: string;
	resumableUploadsCache?: KeyValueStorageInterface;
	expectedBucketOwner?: string;
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
	checksumAlgorithm,
	optionsHash,
	resumableUploadsCache,
	expectedBucketOwner,
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

	if (!resumableUploadsCache) {
		logger.debug(
			'uploaded cache instance cannot be determined, skipping cache.',
		);
		cachedUpload = undefined;
	} else {
		const uploadCacheKey = getUploadsCacheKey({
			size,
			contentType,
			file: data instanceof File ? data : undefined,
			bucket,
			accessLevel,
			key,
			optionsHash,
		});

		const cachedUploadParts = await findCachedUploadParts({
			s3Config,
			cacheKey: uploadCacheKey,
			bucket,
			finalKey,
			resumableUploadsCache,
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
		const finalCrc32 =
			checksumAlgorithm === CHECKSUM_ALGORITHM_CRC32
				? await getCombinedCrc32(data, size)
				: undefined;

		const { UploadId } = await createMultipartUpload(
			{
				...s3Config,
				abortSignal,
			},
			{
				Bucket: bucket,
				Key: finalKey,
				ContentType: contentType,
				ContentDisposition: constructContentDisposition(contentDisposition),
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ChecksumAlgorithm: finalCrc32 ? 'CRC32' : undefined,
				ExpectedBucketOwner: expectedBucketOwner,
			},
		);

		if (resumableUploadsCache) {
			const uploadCacheKey = getUploadsCacheKey({
				size,
				contentType,
				file: data instanceof File ? data : undefined,
				bucket,
				accessLevel,
				key,
				optionsHash,
			});
			await cacheMultipartUpload(resumableUploadsCache, uploadCacheKey, {
				uploadId: UploadId!,
				bucket,
				key,
				finalCrc32,
				fileName: data instanceof File ? data.name : '',
			});
		}

		return {
			uploadId: UploadId!,
			cachedParts: [],
			finalCrc32,
		};
	}
};
