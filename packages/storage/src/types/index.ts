// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './Storage';
export * from './Provider';
export * from './AWSS3Provider';

export { DownloadTask, TransferProgressEvent } from './common';
export {
	StorageConfig,
	StorageListRequest,
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageOperationRequest,
	StorageDownloadDataRequest,
	StorageDownloadFileParameter,
	StorageUploadDataParameter,
	StorageOptions,
	StorageUploadFileParameter, // TODO: open question - should we export this?
	StorageRemoveOptions,
	copyRequest,
	StorageCopyItem,
} from './params';
export {
	StorageItem,
	StorageListResult,
	StorageDownloadDataResult,
	StorageGetUrlResult,
	StorageUploadResult,
	StorageRemoveResult,
} from './results';
