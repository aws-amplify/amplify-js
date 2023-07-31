// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export * from './Storage';
export * from './Provider';
export * from './AWSS3Provider';

export { DownloadTask, TransferProgressEvent } from './common';
export {
	StorageOperationParameter,
	StorageDownloadDataParameter,
	StorageDownloadFileParameter,
	// StorageOptions, // TODO: export this when v5 implementations are cleaned up
	StorageUploadDataParameter,
	StorageUploadFileParameter, // TODO: open question - should we export this?
} from './params';
export {
	StorageDownloadDataResult,
	StorageGetUrlResult,
	StorageUploadResult,
} from './results';
