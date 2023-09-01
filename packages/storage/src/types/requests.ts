// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOptions,
	StorageUploadSourceOptions,
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageCopySourceOptions,
	StorageCopyDestinationOptions,
} from './options';

export type OperationRequest<Options extends StorageOptions> = {
	key: string;
	options?: Options;
};

export type GetPropertiesRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type StorageListRequest<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	path?: string;
	options?: Options;
};

export type StorageDownloadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type StorageUploadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options> & {
		data: StorageUploadSourceOptions;
	};

export type CopyRequest = {
	source: StorageCopySourceOptions;
	destination: StorageCopyDestinationOptions;
};
