// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6) this uses V5 Credentials, update to V6.
import { Credentials } from '@aws-sdk/types';

import { TransferProgressEvent } from '../../../types';
import {
	StorageOptions,
	StorageListAllOptions,
	StorageListPaginateOptions,
} from '../../../types/options';

/**
 * Input options type for S3 Storage operations.
 */
export type Options = StorageOptions & {
	/**
	 * Whether to use accelerate endpoint.
	 * @default false
	 */
	useAccelerateEndpoint?: boolean;
};

/**
 * Input options type for S3 getProperties API.
 */
export type GetPropertiesOptions = Options;

/**
 * Input options type for S3 getProperties API.
 */
export type RemoveOptions = Options;

/**
 * Input options type for S3 list API.
 */
export type ListAllOptions = StorageListAllOptions;

/**
 * Input options type for S3 list API.
 */
export type ListPaginateOptions = StorageListPaginateOptions;

/**
 * Input options type for S3 downloadData API.
 */
export type DownloadDataOptions = TransferOptions;

/**
 * Input options type for S3 getUrl API.
 */
export type GetUrlOptions = Options & {
	/**
	 * Whether to head object to make sure the object existence before downloading.
	 * @default false
	 */
	validateObjectExistence?: boolean;
	/**
	 * Number of seconds till the URL expires.
	 * @default 900 (15 minutes)
	 */
	expiresIn?: number;
};

export type UploadDataOptions = Omit<TransferOptions, 'targetIdentityId'> & {
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
};

/**
 * Internal only type for S3 API handlers' config parameter.
 *
 * @internal
 */
export type ResolvedS3Config = {
	region: string;
	credentials: Credentials;
	customEndpoint?: string;
	forcePathStyle?: boolean;
	useAccelerateEndpoint?: boolean;
};
/**
 * Input options type for S3 downloadData, uploadData APIs.
 */
type TransferOptions = Options & {
	/**
	 * Callback function tracking the upload/download progress.
	 */
	onProgress?: (event: TransferProgressEvent) => void;
};
