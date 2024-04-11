// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadTask,
	StorageDownloadDataOutput,
	StorageGetUrlOutput,
	StorageItemWithKey,
	StorageItemWithPath,
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
 * type for S3 list item.
 */
export type ListOutputItem = Omit<ItemWithKeyAndPath, 'metadata'>;

/**
 * @deprecated Use {@link ItemWithPath} instead.
 */
export type ItemWithKey = ItemBase & StorageItemWithKey;

/**
 * type for S3 list item with path.
 */
export type ItemWithPath = ItemBase & StorageItemWithPath;

export type ItemWithKeyAndPath = ItemBase &
	StorageItemWithKey &
	StorageItemWithPath;

/**
 * Output type for S3 downloadData API.
 */
export type DownloadDataOutput = DownloadTask<
	StorageDownloadDataOutput<ItemWithPath & ItemWithKey>
>;

/**
 * Output type for S3 uploadData API.
 */
export type UploadDataOutput = UploadTask<ItemWithKeyAndPath>;

/**
 * Output type for S3 getUrl API.
 */
export type GetUrlOutput = StorageGetUrlOutput;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput = ItemWithKeyAndPath;

/**
 * Output type for S3 Copy API.
 */
export type CopyOutput = Pick<ItemWithKeyAndPath, 'key' | 'path'>;

/**
 * Output type for S3 remove API.
 */
export type RemoveOutput = Pick<ItemWithKeyAndPath, 'key' | 'path'>;

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
