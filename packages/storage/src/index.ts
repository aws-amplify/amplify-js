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
	UploadDataInputWithPath,
	DownloadDataInput,
	DownloadDataInputWithPath,
	RemoveInput,
	RemoveInputWithPath,
	ListAllInput,
	ListAllInputWithPath,
	ListPaginateInput,
	ListPaginateInputWithPath,
	GetPropertiesInput,
	GetPropertiesInputWithPath,
	CopyInput,
	CopyInputWithPath,
	GetUrlInput,
	GetUrlInputWithPath,
} from './providers/s3/types/inputs';

export {
	UploadDataOutput,
	UploadDataOutputWithPath,
	DownloadDataOutput,
	DownloadDataOutputWithPath,
	RemoveOutput,
	RemoveOutputWithPath,
	ListAllOutput,
	ListAllOutputWithPath,
	ListPaginateOutput,
	ListPaginateOutputWithPath,
	GetPropertiesOutput,
	GetPropertiesOutputWithPath,
	CopyOutput,
	CopyOutputWithPath,
	GetUrlOutput,
	GetUrlOutputWithPath,
} from './providers/s3/types/outputs';

export { TransferProgressEvent } from './types';

export { isCancelError } from './errors/CanceledError';
export { StorageError } from './errors/StorageError';
