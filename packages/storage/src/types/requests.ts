// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOptions,
	UploadSource,
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageCopySource,
	StorageCopyDestination,
} from './options';

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

export type StorageDownloadDataRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options>;

export type StorageDownloadFileRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		/**
		 * If supplied full file path in browsers(e.g. path/to/foo.bar)
		 * the directory will be stripped. However, full directory could be
		 * supported in RN.
		 */
		localFile: string;
	};

export type StorageUploadDataRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		data: UploadSource;
	};

export type CopyRequest = {
	source: StorageCopySource;
	destination: StorageCopyDestination;
};
