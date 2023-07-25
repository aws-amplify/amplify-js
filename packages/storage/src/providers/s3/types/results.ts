// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageDownloadDataResult,
	StorageGetUrlResult,
	StorageUploadResult,
} from '../../../types';

type S3ObjectInformation = {
	/**
	 * Creation date of the object.
	 */
	lastModified?: Date;
	/**
	 * Size of the body in bytes.
	 */
	contentLength?: number;
	/**
	 * An entity tag (ETag) is an opaque identifier assigned by a web server to a specific version of a resource found at a URL.
	 */
	eTag?: string;
	/**
	 * The tag-set for the object. The tag-set must be encoded as URL Query parameters. (For example, "Key1=Value1")
	 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-tagging.html
	 */
	metadata?: Record<string, string>;
};

export type S3DownloadDataResult = StorageDownloadDataResult &
	S3ObjectInformation;

export type S3DownloadFileResult = S3ObjectInformation;

export type S3GetUrlResult = StorageGetUrlResult;

export type S3UploadDataResult = StorageUploadResult;

export type S3UploadFileResult = StorageUploadResult;
