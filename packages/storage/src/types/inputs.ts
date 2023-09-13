// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageReadOptions,
	StorageWriteOptions,
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageCopySourceOptions,
	StorageCopyDestinationOptions,
} from './options';

export type StorageOperationInput<
	Options extends StorageReadOptions | StorageWriteOptions
> = {
	key: string;
	options?: Options;
};

export type StorageGetPropertiesInput<Options extends StorageReadOptions> =
	StorageOperationInput<Options>;

export type StorageRemoveInput<Options extends StorageWriteOptions> = {
	key: string;
	options?: Options;
};

export type StorageListInput<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	prefix?: string;
	options?: Options;
};

export type StorageGetUrlInput<Options extends StorageReadOptions> =
	StorageOperationInput<Options>;

export type StorageDownloadDataInput<Options extends StorageReadOptions> =
	StorageOperationInput<Options>;

export type StorageUploadDataInput<Options extends StorageWriteOptions> =
	StorageOperationInput<Options> & {
		data: StorageUploadDataPayload;
	};

export type StorageCopyInput = {
	source: StorageCopySourceOptions;
	destination: StorageCopyDestinationOptions;
};

/**
 * The data payload type for upload operation.
 */
export type StorageUploadDataPayload = Blob | BufferSource | string | File;
