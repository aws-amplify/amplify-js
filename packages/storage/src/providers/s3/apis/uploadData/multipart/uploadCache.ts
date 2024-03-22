// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	StorageAccessLevel,
	defaultStorage,
} from '@aws-amplify/core';

import { UPLOADS_STORAGE_KEY } from '../../../utils/constants';
import { ResolvedS3Config } from '../../../types/options';
import { Part, listParts } from '../../../utils/client';
import { logger } from '../../../../../utils';

const ONE_HOUR = 1000 * 60 * 60;

interface FindCachedUploadPartsOptions {
	cacheKey: string;
	s3Config: ResolvedS3Config;
	bucket: string;
	finalKey: string;
}

/**
 * Find the cached multipart upload id and get the parts that have been uploaded
 * with ListParts API. If the cached upload is expired(1 hour), return null.
 */
export const findCachedUploadParts = async ({
	cacheKey,
	s3Config,
	bucket,
	finalKey,
}: FindCachedUploadPartsOptions): Promise<{
	parts: Part[];
	uploadId: string;
} | null> => {
	const cachedUploads = await listCachedUploadTasks(defaultStorage);
	if (
		!cachedUploads[cacheKey] ||
		cachedUploads[cacheKey].lastTouched < Date.now() - ONE_HOUR // Uploads are cached for 1 hour
	) {
		return null;
	}

	const cachedUpload = cachedUploads[cacheKey];
	cachedUpload.lastTouched = Date.now();

	await defaultStorage.setItem(
		UPLOADS_STORAGE_KEY,
		JSON.stringify(cachedUploads),
	);

	try {
		const { Parts = [] } = await listParts(s3Config, {
			Bucket: bucket,
			Key: finalKey,
			UploadId: cachedUpload.uploadId,
		});

		return {
			parts: Parts,
			uploadId: cachedUpload.uploadId,
		};
	} catch (e) {
		logger.debug('failed to list cached parts, removing cached upload.');
		await removeCachedUpload(cacheKey);

		return null;
	}
};

interface FileMetadata {
	bucket: string;
	fileName: string;
	key: string;
	uploadId: string;
	// Unix timestamp in ms
	lastTouched: number;
}

const listCachedUploadTasks = async (
	kvStorage: KeyValueStorageInterface,
): Promise<Record<string, FileMetadata>> => {
	try {
		return JSON.parse((await kvStorage.getItem(UPLOADS_STORAGE_KEY)) ?? '{}');
	} catch (e) {
		logger.debug('failed to parse cached uploads record.');

		return {};
	}
};

interface UploadsCacheKeyOptions {
	size: number;
	contentType?: string;
	bucket: string;
	accessLevel?: StorageAccessLevel;
	key: string;
	file?: File;
}

/**
 * Get the cache key of a multipart upload. Data source cached by different: size, content type, bucket, access level,
 * key. If the data source is a File instance, the upload is additionally indexed by file name and last modified time.
 * So the library always created a new multipart upload if the file is modified.
 */
export const getUploadsCacheKey = ({
	file,
	size,
	contentType,
	bucket,
	accessLevel,
	key,
}: UploadsCacheKeyOptions) => {
	let levelStr;
	const resolvedContentType =
		contentType ?? file?.type ?? 'application/octet-stream';

	// If no access level is defined, we're using custom gen2 access rules
	if (accessLevel === undefined) {
		levelStr = 'custom';
	} else {
		levelStr = accessLevel === 'guest' ? 'public' : accessLevel;
	}

	const baseId = `${size}_${resolvedContentType}_${bucket}_${levelStr}_${key}`;

	if (file) {
		return `${file.name}_${file.lastModified}_${baseId}`;
	} else {
		return baseId;
	}
};

export const cacheMultipartUpload = async (
	cacheKey: string,
	fileMetadata: Omit<FileMetadata, 'lastTouched'>,
): Promise<void> => {
	const cachedUploads = await listCachedUploadTasks(defaultStorage);
	cachedUploads[cacheKey] = {
		...fileMetadata,
		lastTouched: Date.now(),
	};
	await defaultStorage.setItem(
		UPLOADS_STORAGE_KEY,
		JSON.stringify(cachedUploads),
	);
};

export const removeCachedUpload = async (cacheKey: string): Promise<void> => {
	const cachedUploads = await listCachedUploadTasks(defaultStorage);
	delete cachedUploads[cacheKey];
	await defaultStorage.setItem(
		UPLOADS_STORAGE_KEY,
		JSON.stringify(cachedUploads),
	);
};
