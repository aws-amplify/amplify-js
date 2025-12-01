// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	uploadData,
	downloadData,
	remove,
	list,
	getProperties,
	copy,
	getUrl,
	removeObjects,
	removeMultiple,
} from './providers/s3';

export {
	UploadDataInput,
	UploadDataWithPathInput,
	DownloadDataInput,
	DownloadDataWithPathInput,
	RemoveInput,
	RemoveWithPathInput,
	RemoveObjectsInput,
	RemoveMultipleInput,
	ProgressInfo,
	FolderDeletionOptions,
	FolderDeletionProgress,
	ListAllInput,
	ListAllWithPathInput,
	ListPaginateInput,
	ListPaginateWithPathInput,
	GetPropertiesInput,
	GetPropertiesWithPathInput,
	CopyInput,
	CopyWithPathInput,
	GetUrlInput,
	GetUrlWithPathInput,
} from './providers/s3/types/inputs';

export {
	UploadDataOutput,
	UploadDataWithPathOutput,
	DownloadDataOutput,
	DownloadDataWithPathOutput,
	RemoveOutput,
	RemoveWithPathOutput,
	RemoveOperation,
	RemoveObjectsOutput,
	RemoveMultipleOutput,
	RemoveMultipleOperation,
	ListAllOutput,
	ListAllWithPathOutput,
	ListPaginateOutput,
	ListPaginateWithPathOutput,
	GetPropertiesOutput,
	GetPropertiesWithPathOutput,
	CopyOutput,
	CopyWithPathOutput,
	GetUrlOutput,
	GetUrlWithPathOutput,
} from './providers/s3/types/outputs';

export { TransferProgressEvent } from './types';

export { isCancelError } from './errors/CanceledError';
export { StorageError } from './errors/StorageError';

export { DEFAULT_PART_SIZE } from './providers/s3/utils/constants';
