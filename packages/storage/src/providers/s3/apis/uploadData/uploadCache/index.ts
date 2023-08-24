// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	StorageAccessLevel,
} from '@aws-amplify/core';

import { getKvStorage } from './kvStorage';
import { UPLOADS_STORAGE_KEY } from '../../../utils/constants';
import { FileMetadata } from '../../../../..';
import { listParts, Part } from '../../../../../AwsClients/S3';
import { ResolvedS3Config } from '../../../types/options';

export type FindCachedUploadPartsOptions = {
	cacheKey: string;
	s3Config: ResolvedS3Config;
	bucket: string;
	finalKey: string;
};

export const findCachedUploadParts = async ({
	cacheKey,
	s3Config,
	bucket,
	finalKey,
}: FindCachedUploadPartsOptions): Promise<{
	parts: Part[];
	uploadId: string;
} | null> => {
	const kvStorage = await getKvStorage();
	const cachedUploads = await listCachedUploadTasks(kvStorage);
	if (Object.keys(cachedUploads).length === 0 || !cachedUploads[cacheKey]) {
		return null;
	}

	const cachedUpload = cachedUploads[cacheKey];
	cachedUpload.lastTouched = Date.now();

	await kvStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(cachedUploads));

	const { Parts = [] } = await listParts(s3Config, {
		Bucket: bucket,
		Key: finalKey,
		UploadId: cachedUpload.uploadId,
	});

	return {
		parts: Parts,
		uploadId: cachedUpload.uploadId,
	};
};

const listCachedUploadTasks = async (
	kvStorage: KeyValueStorageInterface
): Promise<Record<string, FileMetadata>> =>
	JSON.parse((await kvStorage.getItem(UPLOADS_STORAGE_KEY)) ?? '{}');

export type UploadsCacheKeyOptions = {
	size: number;
	contentType?: string;
	bucket: string;
	accessLevel: StorageAccessLevel;
	key: string;
	file?: File;
};
export const getUploadsCacheKey = ({
	file,
	size,
	contentType,
	bucket,
	accessLevel,
	key,
}: UploadsCacheKeyOptions) => {
	const resolvedContentType =
		contentType ?? (file ? file.type : 'binary/octet-stream');
	const levelStr = accessLevel === 'guest' ? 'public' : accessLevel;
	const baseId = `${size}_${resolvedContentType}_${bucket}_${levelStr}_${key}`;
	if (file) {
		return `${file.name}_${file.lastModified}_${baseId}`;
	} else {
		return baseId;
	}
};

export const cacheMultipartUpload = async (
	cacheKey: string,
	fileMetadata: FileMetadata
): Promise<void> => {
	const kvStorage = await getKvStorage();
	const cachedUploads = await listCachedUploadTasks(kvStorage);
	cachedUploads[cacheKey] = fileMetadata;
	await kvStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(cachedUploads));
};

export const removeCachedUpload = async (cacheKey: string): Promise<void> => {
	const kvStorage = await getKvStorage();
	const cachedUploads = await listCachedUploadTasks(kvStorage);
	delete cachedUploads[cacheKey];
	await kvStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(cachedUploads));
};
