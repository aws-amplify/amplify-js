// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './Storage';
export * from './Provider';
export * from './AWSS3Provider';

export { DownloadTask, TransferProgressEvent } from './common';
export {
	StorageOperationRequest,
	StorageDownloadDataRequest,
	StorageDownloadFileParameter,
	StorageUploadDataParameter,
	StorageOptions,
	StorageUploadFileParameter, // TODO: open question - should we export this?
	StorageRemoveOptions,
} from './params';
export {
	StorageDownloadDataResult,
	StorageGetUrlResult,
	StorageUploadResult,
	StorageItem,
	StorageRemoveResult,
} from './results';
