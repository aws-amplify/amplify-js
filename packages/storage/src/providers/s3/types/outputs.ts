// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadTask,
	StorageDownloadDataOutput,
	StorageGetUrlOutput,
	StorageItem,
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

export type ItemWithKeyAndPath = ItemBase & StorageItem;

/**
 * Output type for S3 downloadData API.
 */
export type DownloadDataOutput = DownloadTask<
	StorageDownloadDataOutput<ItemWithKeyAndPath>
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
<<<<<<< HEAD
=======
export type ListAllOutput = StrictUnion<
	ListAllOutputWithPath | ListAllOutputWithPrefix
>;

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput = StrictUnion<
	ListPaginateOutputWithPath | ListPaginateOutputWithPrefix
>;

/**
 * @deprecated Use {@link ListAllOutputWithPath} instead.
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutputWithPrefix = StorageListOutput<ListOutputItemWithKey>;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutputWithPath = StorageListOutput<ListOutputItemWithPath>;

/**
 * @deprecated Use {@link ListPaginateOutputWithPath} instead.
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutputWithPrefix =
	StorageListOutput<ListOutputItemWithKey> & {
		nextToken?: string;
	};

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutputWithPath =
	StorageListOutput<ListOutputItemWithPath> & {
		nextToken?: string;
	};

/**
 * Output type for S3 Copy API.
 */
>>>>>>> 28ca2f3ec (update copy return types)
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
