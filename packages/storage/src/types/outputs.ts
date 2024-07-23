// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResponseBodyMixin } from '@aws-amplify/core/internals/aws-client-utils';

/**
 * Base type for a storage item.
 */
export interface StorageItemBase {
	/**
	 * Creation date of the object.
	 */
	lastModified?: Date;
	/**
	 * Size of the body in bytes.
	 */
	size?: number;
	/**
	 * An entity tag (ETag) is an opaque identifier assigned by a web server to a specific version of a resource found at
	 * a URL.
	 */
	eTag?: string;
	/**
	 * The user-defined metadata for the object uploaded to S3.
	 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#UserMetadata
	 */
	metadata?: Record<string, string>;
}

/** @deprecated Use {@link StorageItemWithPath} instead. */
export type StorageItemWithKey = StorageItemBase & {
	/**
	 * @deprecated This may be removed in next major version.
	 * Key of the object.
	 */
	key: string;
};

export type StorageItemWithPath = StorageItemBase & {
	/**
	 * Path of the object.
	 */
	path: string;
};

/**
 * A storage item can be identified either by a key or a path.
 */
export type StorageItem = StorageItemWithKey | StorageItemWithPath;

export type StorageDownloadDataOutput<Item extends StorageItem> = Item & {
	body: ResponseBodyMixin;
};

export interface StorageGetUrlOutput {
	/**
	 * presigned URL of the given object.
	 */
	url: URL;
	/**
	 * expiresAt is date in which generated URL expires.
	 */
	expiresAt: Date;
}

export type StorageUploadOutput<Item extends StorageItem> = Item;

export interface StorageListOutput<Item extends StorageItem> {
	/**
	 * List of items returned by the list API.
	 */
	items: Item[];
	/**
	 * List of excluded subpaths when `exclude` is passed as part of the `subpathStrategy` of the input options.
	 */
	excludedSubpaths?: string[];
}
