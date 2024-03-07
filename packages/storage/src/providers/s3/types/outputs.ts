// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadTask,
	StorageDownloadDataOutput,
	StorageGetUrlOutput,
	StorageItemKey,
	StorageItemPath,
	StorageListOutput,
	UploadTask,
} from '../../../types';

/**
 * Base type for an S3 item.
 */
export interface ItemBase {
	/**
	 * VersionId used to reference a specific version of the object.
	 */
	versionId?: string;
	/**
	 * A standard MIME type describing the format of the object data.
	 */
	contentType?: string;
}

/**
 * @deprecated Use {@link ItemPath} instead.
 */
export type ItemKey = ItemBase & StorageItemKey;
export type ItemPath = ItemBase & StorageItemPath;

/**
 * type for S3 list item.
 */
export type ListOutputItem = Omit<ItemKey, 'metadata'>;

/**
 * Output type for S3 downloadData API.
 */

/** @deprecated Use {@link DownloadDataOutputPath} instead. */
export type DownloadDataOutputKey = DownloadTask<
	StorageDownloadDataOutput<ItemKey>
>;
export type DownloadDataOutputPath = DownloadTask<
	StorageDownloadDataOutput<ItemPath>
>;
export type DownloadDataOutput = DownloadDataOutputKey | DownloadDataOutputPath;

/**
 * Output type for S3 getUrl API.
 */
export type GetUrlOutput = StorageGetUrlOutput;

/**
 * Output type for S3 uploadData API.
 */
/** @deprecated Use {@link UploadDataOutputPath} instead. */
export type UploadDataOutputKey = UploadTask<ItemKey>;
export type UploadDataOutputPath = UploadTask<ItemPath>;
export type UploadDataOutput = UploadDataOutputKey | UploadDataOutputPath;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput = ItemKey;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutput = StorageListOutput<ListOutputItem>;

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput = StorageListOutput<ListOutputItem> & {
	nextToken?: string;
};

/**
 * Output type for S3 copy API.
 */
export type CopyOutput = Pick<ItemKey, 'key'>;

/**
 * Output type for S3 remove API.
 */
export type RemoveOutput = Pick<ItemKey, 'key'>;
