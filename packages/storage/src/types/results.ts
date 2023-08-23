// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers } from '@aws-amplify/core/internals/aws-client-utils';

export type StorageItem = {
	/**
	 * Key of the object
	 */
	key?: string;
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
};

// TODO: replace with ResponsePayloadMixin from core
type Payload = Pick<Body, 'blob' | 'json' | 'text'>;

export type StorageDownloadDataResult<T extends StorageItem> = T & {
	body: Payload;
};

export type StorageGetUrlResult = {
	/**
	 * presigned URL of the given object.
	 */
	url: URL;
	/**
	 * expiresAt is date in which generated URL expires.
	 */
	expiresAt: Date;
};

export type StorageUploadResult = {
	key: string;
};

export type StorageRemoveResult = {
	key: string;
};

export type StorageListResult<Item extends StorageItem> = {
	items: Item[];
};
