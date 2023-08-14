// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageDownloadDataResult,
	StorageGetUrlResult,
	StorageItem,
	StorageUploadResult,
} from '../../../types';

export interface S3Item extends StorageItem {
	/**
	 * VersionId used to reference a specific version of the object.
	 */
	versionId?: string;
	/**
	 * A standard MIME type describing the format of the object data.
	 */
	contentType?: string;
}

export type S3DownloadDataResult = StorageDownloadDataResult<S3Item>;

export type S3DownloadFileResult = S3Item;

export type S3GetUrlResult = StorageGetUrlResult;

export type S3UploadDataResult = StorageUploadResult;

export type S3UploadFileResult = StorageUploadResult;

export type S3GetPropertiesResult = S3Item;
