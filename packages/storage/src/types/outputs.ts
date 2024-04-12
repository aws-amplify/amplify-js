// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResponseBodyMixin } from '@aws-amplify/core/internals/aws-client-utils';

/**
 * Base type for a storage item.
 */
export interface StorageItemBase {
	/**
	 * @deprecated This may be removed in next major version
	 * Key of the object
	 */
	key: string;
	/**
	 * Path of the object
	 */
	path: string;
}

/**
 * A storage item can be identified either by a key or a path.
 */
export type StorageItem = StorageItemBase & {
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
	/**
	 * VersionId used to reference a specific version of the object.
	 */
	versionId?: string;
	/**
	 * A standard MIME type describing the format of the object data.
	 */
	contentType?: string;
};

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
export interface StorageListOutput<Item extends StorageItem> {
	/**
	 * List of items returned by the list API.
	 */
	items: Item[];
}
