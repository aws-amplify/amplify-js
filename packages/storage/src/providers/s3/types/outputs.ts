// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

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
 * type for S3 list item with key.
 */
export type ListOutputItemKey = Omit<ItemKey, 'metadata'>;

/**
 * type for S3 list item with path.
 */
export type ListOutputItemPath = Omit<ItemPath, 'metadata'>;

/**
 * @deprecated Use {@link ItemPath} instead.
 */
export type ItemKey = ItemBase & StorageItemKey;

/**
 * type for S3 list item with path.
 */
export type ItemPath = ItemBase & StorageItemPath;

/**
 * type for S3 list item.
 */
export type ListOutputItem = Omit<ItemKey, 'metadata'>;

/** @deprecated Use {@link DownloadDataOutputPath} instead. */
export type DownloadDataOutputKey = DownloadTask<
	StorageDownloadDataOutput<ItemKey>
>;
export type DownloadDataOutputPath = DownloadTask<
	StorageDownloadDataOutput<ItemPath>
>;

/**
 * Output type for S3 downloadData API.
 */
export type DownloadDataOutput = DownloadDataOutputKey | DownloadDataOutputPath;

/**
 * Output type for S3 getUrl API.
 */
export type GetUrlOutput = StorageGetUrlOutput;

/**
 * Output type for S3 uploadData API.
 */
export type UploadDataOutput = UploadTask<ItemKey>;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput = ItemKey;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutput = StrictUnion<
	ListAllOutputPath | ListAllOutputPrefix
>;

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput =
	| ListPaginateOutputPath
	| ListPaginateOutputPrefix;

/**
 * @deprecated Use {@link ListAllOutputPath} instead.
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutputPrefix = StorageListOutput<ListOutputItemKey>;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutputPath = StorageListOutput<ListOutputItemPath>;

/**
 * @deprecated Use {@link ListPaginateOutputPath} instead.
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutputPrefix = StorageListOutput<ListOutputItemKey> & {
	nextToken?: string;
};

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutputPath = StorageListOutput<ListOutputItemPath> & {
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
