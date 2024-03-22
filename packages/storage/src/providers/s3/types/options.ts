// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { TransferProgressEvent } from '../../../types';
import {
	StorageListAllOptions,
	StorageListPaginateOptions,
} from '../../../types/options';

interface CommonOptions {
	/**
	 * Whether to use accelerate endpoint.
	 * @default false
	 */
	useAccelerateEndpoint?: boolean;
}

/** @deprecated This may be removed in the next major version. */
type ReadOptions =
	| {
			/** @deprecated This may be removed in the next major version. */
			accessLevel?: 'guest' | 'private';
	  }
	| {
			/** @deprecated This may be removed in the next major version. */
			accessLevel: 'protected';
			/** @deprecated This may be removed in the next major version. */
			targetIdentityId?: string;
	  };

/** @deprecated This may be removed in the next major version. */
interface WriteOptions {
	/** @deprecated This may be removed in the next major version. */
	accessLevel?: StorageAccessLevel;
}

interface BytesRangeOptions {
	bytesRange?: {
		start: number;
		end: number;
	};
}

/**
 * Transfer-related options type for S3 downloadData, uploadData APIs.
 */
interface TransferOptions {
	/**
	 * Callback function tracking the upload/download progress.
	 */
	onProgress?(event: TransferProgressEvent): void;
}

/**
 * Input options type for S3 getProperties API.
 */
export type GetPropertiesOptions = ReadOptions & CommonOptions;

/**
 * Input options type for S3 getProperties API.
 */
export type RemoveOptions = WriteOptions & CommonOptions;

/**
 * @deprecated Use {@link ListAllOptionsPath} instead.
 * Input options type with prefix for S3 list all API.
 */
export type ListAllOptionsPrefix = StorageListAllOptions &
	ReadOptions &
	CommonOptions;

/**
 * @deprecated Use {@link ListPaginateOptionsPath} instead.
 * Input options type with prefix for S3 list API to paginate items.
 */
export type ListPaginateOptionsPrefix = StorageListPaginateOptions &
	ReadOptions &
	CommonOptions;

/**
 * Input options type with path for S3 list all API.
 */
export type ListAllOptionsPath = Omit<StorageListAllOptions, 'accessLevel'> &
	CommonOptions;

/**
 * Input options type with path for S3 list API to paginate items.
 */
export type ListPaginateOptionsPath = Omit<
	StorageListPaginateOptions,
	'accessLevel'
> &
	CommonOptions;

/**
 * Input options type for S3 getUrl API.
 */
export type GetUrlOptions = ReadOptions &
	CommonOptions & {
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

/**
 * Input options type for S3 downloadData API.
 */
export type DownloadDataOptions = CommonOptions &
	TransferOptions &
	BytesRangeOptions;

/** @deprecated Use {@link DownloadDataOptionsPath} instead. */
export type DownloadDataOptionsKey = ReadOptions & DownloadDataOptions;
export type DownloadDataOptionsPath = DownloadDataOptions;

export type UploadDataOptions = WriteOptions &
	CommonOptions &
	TransferOptions & {
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

/** @deprecated This may be removed in the next major version. */
export type CopySourceOptionsKey = ReadOptions & {
	/** @deprecated This may be removed in the next major version. */
	key: string;
};

/** @deprecated This may be removed in the next major version. */
export type CopyDestinationOptionsKey = WriteOptions & {
	/** @deprecated This may be removed in the next major version. */
	key: string;
};

/**
 * Internal only type for S3 API handlers' config parameter.
 *
 * @internal
 */
export interface ResolvedS3Config {
	region: string;
	credentials: AWSCredentials;
	customEndpoint?: string;
	forcePathStyle?: boolean;
	useAccelerateEndpoint?: boolean;
}
