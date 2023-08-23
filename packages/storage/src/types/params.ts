// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export type StorageOptions =
	| { accessLevel?: 'guest' | 'private' }
	| {
			accessLevel: 'protected';
			targetIdentityId: string;
	  };

export type StorageOperationRequest<Options extends StorageOptions> = {
	key: string;
	options?: Options;
};

export type StorageListRequest<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	path?: string;
	options?: Options;
};

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageDownloadDataRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options>;

export type StorageDownloadFileParameter<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		/**
		 * If supplied full file path in browsers(e.g. path/to/foo.bar)
		 * the directory will be stripped. However, full directory could be
		 * supported in RN.
		 */
		localFile: string;
	};

/**
 * The data payload type for upload operation.
 */
export type UploadSource =
	| Blob
	| BufferSource
	| FormData
	| URLSearchParams
	| string
	| File;

export type StorageUploadDataRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		data: UploadSource;
	};

export type StorageRemoveOptions = StorageOptions;

export type StorageCopySource = {
	key: string;
} & StorageOptions;

export type StorageCopyDestination = {
	key: string;
	accessLevel?: StorageAccessLevel;
};

export type CopyRequest = {
	source: StorageCopySource;
	destination: StorageCopyDestination;
};
