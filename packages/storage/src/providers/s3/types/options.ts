// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferProgressEvent } from '../../../types';
import { StorageOptions } from '../../../types/params';

type S3Options = StorageOptions & {
	/**
	 * Whether to use accelerate endpoint.
	 * @default false
	 */
	useAccelerateEndpoint?: boolean;
};

/**
 * Parameter options interface for S3 downloadData, downloadFile, uploadData, uploadFile APIs.
 */
export type S3TransferOptions = S3Options & {
	/**
	 * Callback function tracking the upload/download progress.
	 */
	onProgress?: (event: TransferProgressEvent) => void;
};

export type S3GetUrlOptions = S3Options & {
	/**
	 * Whether to head object to make sure the object existence before downloading.
	 * @default false
	 */
	validateObjectExistence?: boolean;
	/**
	 * Number of seconds till the URL expires.
	 * @default 900 (15 minutes)
	 */
	expiration?: number;
};

export type S3UploadOptions = S3TransferOptions & {
	/**
	 * The default content-disposition header value of the file when downloading it.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
	 */
	contentDisposition?: string;
	/**
	 * The default content-encoding header value of the file when downloading it.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
	 */
	contentEncoding?: string;
	/**
	 * The default content-type header value of the file when downloading it.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
	 */
	contentType?: string;
	/**
	 * The user-defined metadata for the object uploaded to S3.
	 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#UserMetadata
	 */
	metadata?: Record<string, string>;
	/**
	 * The tag-set for the object. The tag-set must be encoded as URL Query parameters. (For example, "Key1=Value1")
	 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-tagging.html
	 */
	tagging?: string;
};
