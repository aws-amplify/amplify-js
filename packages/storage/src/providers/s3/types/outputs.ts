// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

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
export type ListOutputItemWithKey = Omit<ItemWithKey, 'metadata'>;

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
 * type for S3 list item.
 */
export type ListOutputItem = Omit<ItemWithKey, 'metadata'>;

/** @deprecated Use {@link DownloadDataOutputWithPath} instead. */
export type DownloadDataOutputWithKey = DownloadTask<
	StorageDownloadDataOutput<ItemWithKey>
>;
export type DownloadDataOutputWithPath = DownloadTask<
	StorageDownloadDataOutput<ItemWithPath>
>;

/**
 * Output type for S3 downloadData API.
 */
export type DownloadDataOutput =
	| DownloadDataOutputWithKey
	| DownloadDataOutputWithPath;

/**
 * Output type for S3 getUrl API.
 */
export type GetUrlOutput = StorageGetUrlOutput;

/** @deprecated Use {@link UploadDataOutputWithPath} instead. */
export type UploadDataOutputWithKey = UploadTask<ItemWithKey>;
export type UploadDataOutputWithPath = UploadTask<ItemWithPath>;

/**
 * Output type for S3 uploadData API.
 */
export type UploadDataOutput =
	| UploadDataOutputWithKey
	| UploadDataOutputWithPath;

/** @deprecated Use {@link GetPropertiesOutputWithPath} instead. */
export type GetPropertiesOutputWithKey = ItemWithKey;
export type GetPropertiesOutputWithPath = ItemWithPath;

/**
 * Output type for S3 getProperties API.
 */
export type GetPropertiesOutput = ItemWithKey & ItemWithPath;

/**
 * Output type for S3 list API. Lists all bucket objects.
 */
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
 * @deprecated Use {@link CopyOutputWithPath} instead.
 */
export type CopyOutputWithKey = Pick<ItemWithKey, 'key'>;
export type CopyOutputWithPath = Pick<ItemWithPath, 'path'>;

export type CopyOutput = StrictUnion<CopyOutputWithKey | CopyOutputWithPath>;

/**
 * Output type for S3 remove API.
 */
export type RemoveOutput = Pick<ItemWithKey & ItemWithPath, 'key' | 'path'>;
