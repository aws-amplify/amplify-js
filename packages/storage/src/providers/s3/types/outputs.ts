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
 * @deprecated Use {@link ItemPath} instead.
 */
export type ItemKey = ItemBase & StorageItemKey;
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
export type ListAllOutput = StorageListOutput<ListOutputItem>;

/**
 * Output type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateOutput = StorageListOutput<ListOutputItem> & {
	nextToken?: string;
};

/**
 * @deprecated Use {@link CopyOutputPath} instead.
 */
export type CopyOutputKey = Pick<ItemKey, 'key'>;
export type CopyOutputPath = Pick<ItemPath, 'path'>;

export type CopyOutput = StrictUnion<CopyOutputKey | CopyOutputPath>;

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
