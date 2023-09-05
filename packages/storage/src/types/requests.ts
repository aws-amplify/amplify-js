// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOptions,
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

export type RemoveRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type ListRequest<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	path?: string;
	options?: Options;
};

export type GetUrlRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type DownloadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options>;

export type UploadDataRequest<Options extends StorageOptions> =
	OperationRequest<Options> & {
		data: UploadDataPayload;
	};

export type CopyRequest = {
	source: StorageCopySourceOptions;
	destination: StorageCopyDestinationOptions;
};

/**
 * The data payload type for upload operation.
 */
export type UploadDataPayload = Blob | BufferSource | string | File;
