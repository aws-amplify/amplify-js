// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

import {
	cacheMultipartUpload,
	findCachedUploadParts,
	getUploadsCacheKey,
} from './uploadCache';
import { ResolvedS3Config } from '../../../types/options';
import { StorageUploadPayload } from '../../../../../types';
import { Part, createMultipartUpload } from '../../../utils/client';

type LoadOrCreateMultipartUploadOptions = {
	s3Config: ResolvedS3Config;
	data: StorageUploadPayload;
	bucket: string;
	accessLevel: StorageAccessLevel;
	keyPrefix: string;
	key: string;
	contentType?: string;
	contentDisposition?: string;
	contentEncoding?: string;
	metadata?: Record<string, string>;
	size?: number;
	abortSignal?: AbortSignal;
};

type LoadOrCreateMultipartUploadResult = {
	uploadId: string;
	cachedParts: Part[];
};

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
	const finalKey = keyPrefix + key;

	let cachedUpload:
		| {
				parts: Part[];
				uploadId: string;
				uploadCacheKey: string;
		  }
		| undefined;
	if (size === undefined) {
		// Cannot determine total length of the data source, so we cannot safely cache the upload
		// TODO: logger message
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
		};
	} else {
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
			}
		);
		if (size === undefined) {
			// Cannot determine total length of the data source, so we cannot safely cache the upload
			// TODO: logger message
			return {
				uploadId: UploadId!,
				cachedParts: [],
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
			fileName: data instanceof File ? data.name : '',
		});
		return {
			uploadId: UploadId!,
			cachedParts: [],
		};
	}
};
