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
} from './providers/s3';

export {
	UploadDataInput,
	UploadDataWithPathInput,
	DownloadDataInput,
	DownloadDataWithPathInput,
	RemoveInput,
	RemoveWithPathInput,
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
