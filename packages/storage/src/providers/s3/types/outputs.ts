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
 * @deprecated Use {@link ListOutputItemPath} instead.
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

/** @deprecated Use {@link UploadDataOutputPath} instead. */
export type UploadDataOutputKey = UploadTask<ItemKey>;
export type UploadDataOutputPath = UploadTask<ItemPath>;

/**
 * Output type for S3 uploadData API.
 */
export type UploadDataOutput = UploadDataOutputKey | UploadDataOutputPath;

/** @deprecated Use {@link GetPropertiesOutputPath} instead. */
export type GetPropertiesOutputKey = ItemKey;
export type GetPropertiesOutputPath = ItemPath;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput =
	| GetPropertiesOutputKey
	| GetPropertiesOutputPath;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
export type ListAllOutput = StrictUnion<
	ListAllOutputPath | ListAllOutputPrefix
>;

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput = StrictUnion<
	ListPaginateOutputPath | ListPaginateOutputPrefix
>;

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
 * @deprecated Use {@link CopyOutputWithPath} instead.
 */
export type CopyOutputWithKey = Pick<ItemKey, 'key'>;
export type CopyOutputWithPath = Pick<ItemPath, 'path'>;

export type CopyOutput = StrictUnion<CopyOutputWithKey | CopyOutputWithPath>;

/**
 * Output type for S3 remove API.
 */
export type RemoveOutput = StrictUnion<RemoveOutputKey | RemoveOutputPath>;

/**
 * @deprecated Use {@link RemoveOutputPath} instead.
 * Output helper type with key for S3 remove API.
 */
export type RemoveOutputKey = Pick<ItemKey, 'key'>;

/**
 * Output helper type with path for S3 remove API.
 */
export type RemoveOutputPath = Pick<ItemPath, 'path'>;
