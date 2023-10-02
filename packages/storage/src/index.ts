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
	UploadInput,
	DownloadInput,
	RemoveInput,
	ListAllInput,
	ListPaginateInput,
	GetPropertiesInput,
	CopyInput,
	GetUrlInput,
} from './providers/s3/types/inputs';

export {
	UploadOutput,
	DownloadOutput,
	RemoveOutput,
	ListAllOutput,
	ListPaginateOutput,
	GetPropertiesOutput,
	CopyOutput,
	GetUrlOutput,
} from './providers/s3/types/outputs';

export { TransferProgressEvent } from './types';

// TODO[AllanZhengYP]: support isCancelError in Node.js with node-fetch
export { isCancelError } from './errors/CanceledError';
export { StorageError } from './errors/StorageError';
