// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	StorageAccessLevel,
} from '@aws-amplify/core';

import { UPLOADS_STORAGE_KEY } from '../../../../utils/constants';
import { ResolvedS3Config } from '../../../../types/options';
import { Part, listParts } from '../../../../utils/client/s3data';
import { logger } from '../../../../../../utils';
// TODO: Remove this interface when we move to public advanced APIs.
import { UploadDataInput as UploadDataWithPathInputWithAdvancedOptions } from '../../../../../../internals/types/inputs';

const ONE_HOUR = 1000 * 60 * 60;

interface FindCachedUploadPartsOptions {
	cacheKey: string;
	s3Config: ResolvedS3Config;
	bucket: string;
	finalKey: string;
	resumableUploadsCache: KeyValueStorageInterface;
}

/**
 * Find the cached multipart upload id and get the parts that have been uploaded
 * with ListParts API. If the cached upload is expired(1 hour), return null.
 */
export const findCachedUploadParts = async ({
	resumableUploadsCache,
	cacheKey,
	s3Config,
	bucket,
	finalKey,
}: FindCachedUploadPartsOptions): Promise<{
	parts: Part[];
	uploadId: string;
	finalCrc32?: string;
} | null> => {
	const cachedUploads = await listCachedUploadTasks(resumableUploadsCache);
	if (
		!cachedUploads[cacheKey] ||
		cachedUploads[cacheKey].lastTouched < Date.now() - ONE_HOUR // Uploads are cached for 1 hour
	) {
		return null;
	}

	const cachedUpload = cachedUploads[cacheKey];
	cachedUpload.lastTouched = Date.now();

	await resumableUploadsCache.setItem(
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
			finalCrc32: cachedUpload.finalCrc32,
		};
	} catch (e) {
		logger.debug('failed to list cached parts, removing cached upload.');
		await removeCachedUpload(resumableUploadsCache, cacheKey);

		return null;
	}
};

interface FileMetadata {
	bucket: string;
	fileName: string;
	key: string;
	uploadId: string;
	finalCrc32?: string;
	// Unix timestamp in ms
	lastTouched: number;
}

const listCachedUploadTasks = async (
	resumableUploadsCache: KeyValueStorageInterface,
): Promise<Record<string, FileMetadata>> => {
	try {
		return JSON.parse(
			(await resumableUploadsCache.getItem(UPLOADS_STORAGE_KEY)) ?? '{}',
		);
	} catch (e) {
		logger.debug('failed to parse cached uploads record.');

		return {};
	}
};

/**
 * Serialize the uploadData API options to string so it can be hashed.
 */
export const serializeUploadOptions = (
	options: UploadDataWithPathInputWithAdvancedOptions['options'] & {
		resumableUploadsCache?: KeyValueStorageInterface;
	} = {},
): string => {
	const unserializableOptionProperties: string[] = [
		'onProgress',
		'resumableUploadsCache', // Internally injected implementation not set by customers
		'locationCredentialsProvider', // Internally injected implementation not set by customers
	] satisfies (keyof typeof options)[];
	const serializableOptions = Object.fromEntries(
		Object.entries(options).filter(
			([key]) => !unserializableOptionProperties.includes(key),
		),
	);

	return JSON.stringify(serializableOptions);
};

interface UploadsCacheKeyOptions {
	size: number;
	contentType?: string;
	bucket: string;
	accessLevel?: StorageAccessLevel;
	key: string;
	file?: File;
	optionsHash: string;
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
	optionsHash,
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

	const baseId = `${optionsHash}_${size}_${resolvedContentType}_${bucket}_${levelStr}_${key}`;

	if (file) {
		return `${file.name}_${file.lastModified}_${baseId}`;
	} else {
		return baseId;
	}
};

export const cacheMultipartUpload = async (
	resumableUploadsCache: KeyValueStorageInterface,
	cacheKey: string,
	fileMetadata: Omit<FileMetadata, 'lastTouched'>,
): Promise<void> => {
	const cachedUploads = await listCachedUploadTasks(resumableUploadsCache);
	cachedUploads[cacheKey] = {
		...fileMetadata,
		lastTouched: Date.now(),
	};
	await resumableUploadsCache.setItem(
		UPLOADS_STORAGE_KEY,
		JSON.stringify(cachedUploads),
	);
};

export const removeCachedUpload = async (
	resumableUploadsCache: KeyValueStorageInterface,
	cacheKey: string,
): Promise<void> => {
	const cachedUploads = await listCachedUploadTasks(resumableUploadsCache);
	delete cachedUploads[cacheKey];
	await resumableUploadsCache.setItem(
		UPLOADS_STORAGE_KEY,
		JSON.stringify(cachedUploads),
	);
};
