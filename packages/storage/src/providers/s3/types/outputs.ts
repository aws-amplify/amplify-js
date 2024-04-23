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
 * @deprecated Use {@link ListOutputItemWithPath} instead.
 * type for S3 list item with key.
 */
export type ListOutputItem = Omit<ItemWithKey, 'metadata'>;

/**
 * type for S3 list item with path.
 */
export type ListOutputItemWithPath = Omit<ItemWithPath, 'metadata'>;

/**
 * @deprecated Use {@link ItemWithPath} instead.
 */
export type ItemWithKey = ItemBase & StorageItemWithKey;

/**
 * type for S3 list item with path.
 */
export type ItemWithPath = ItemBase & StorageItemWithPath;

/**
 * Output type for S3 downloadData API.
 * @deprecated Use {@link DownloadDataWithPathOutput} instead.
 */
export type DownloadDataOutput = DownloadTask<
	StorageDownloadDataOutput<ItemWithKey>
>;
/**
 * Output type with path for S3 downloadData API.
 */
export type DownloadDataWithPathOutput = DownloadTask<
	StorageDownloadDataOutput<ItemWithPath>
>;

/**
 * Output type for S3 getUrl API.
 * @deprecated Use {@link GetUrlWithPathOutput} instead.
 */
export type GetUrlOutput = StorageGetUrlOutput;
/**
 *  Output type with path for S3 getUrl API.
 * */
export type GetUrlWithPathOutput = StorageGetUrlOutput;

/**
 * Output type for S3 uploadData API.
 *  @deprecated Use {@link UploadDataWithPathOutput} instead.
 */
export type UploadDataOutput = UploadTask<ItemWithKey>;
/**
 *  Output type with path for S3 uploadData API.
 * */
export type UploadDataWithPathOutput = UploadTask<ItemWithPath>;

/**
 * Output type for S3 getProperties API.
 * @deprecated Use {@link GetPropertiesWithPathOutput} instead.
 * */
export type GetPropertiesOutput = ItemBase & StorageItemWithKey;
/**
 *  Output type with path for S3 getProperties API.
 * */
export type GetPropertiesWithPathOutput = ItemBase & StorageItemWithPath;

/**
 * @deprecated Use {@link ListAllWithPathOutput} instead.
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutput = StorageListOutput<ListOutputItem>;

/**
 * Output type with path for S3 list API. Lists all bucket objects.
 */
export type ListAllWithPathOutput = StorageListOutput<ListOutputItemWithPath>;

/**
 * @deprecated Use {@link ListPaginateWithPathOutput} instead.
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput = StorageListOutput<ListOutputItem> & {
	nextToken?: string;
};

/**
 * Output type with path for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateWithPathOutput =
	StorageListOutput<ListOutputItemWithPath> & {
		nextToken?: string;
	};

/**
 *  Output type with path for S3 copy API.
 * @deprecated Use {@link CopyWithPathOutput} instead.
 */
export type CopyOutput = Pick<ItemWithKey, 'key'>;
/**
 * Output type with path for S3 copy API.
 */
export type CopyWithPathOutput = Pick<ItemWithPath, 'path'>;

/**
 * @deprecated Use {@link RemoveWithPathOutput} instead.
 * Output type with key for S3 remove API.
 */
export type RemoveOutput = Pick<ItemWithKey, 'key'>;

/**
 * Output type with path for S3 remove API.
 */
export type RemoveWithPathOutput = Pick<ItemWithPath, 'path'>;
