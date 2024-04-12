// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadTask,
	StorageDownloadDataOutput,
	StorageGetUrlOutput,
	StorageItem,
	StorageItemBase,
	StorageListOutput,
	UploadTask,
} from '../../../types';

/**
 * type for S3 list item.
 */
export type ListOutputItem = Omit<StorageItem, 'metadata'>;

/**
 * Output type for S3 downloadData API.
 */
export type DownloadDataOutput = DownloadTask<
	StorageDownloadDataOutput<StorageItem>
>;

/**
 * Output type for S3 uploadData API.
 */
export type UploadDataOutput = UploadTask<StorageItem>;

/**
 * Output type for S3 getUrl API.
 */
export type GetUrlOutput = StorageGetUrlOutput;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput = StorageItem;

/**
 * Output type for S3 Copy API.
 */
export type CopyOutput = StorageItemBase;

/**
 * Output type for S3 remove API.
 */
export type RemoveOutput = StorageItemBase;

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
