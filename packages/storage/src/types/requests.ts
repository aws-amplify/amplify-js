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

export type ListRequest<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	path?: string;
	options?: Options;
};

export type DownloadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type UploadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options> & {
		data: StorageUploadSourceOptions;
	};

export type CopyRequest = {
	source: StorageCopySourceOptions;
	destination: StorageCopyDestinationOptions;
};
