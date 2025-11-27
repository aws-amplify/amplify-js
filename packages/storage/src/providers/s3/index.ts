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
} from './apis';

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
} from './types/inputs';

export {
	UploadDataOutput,
	UploadDataWithPathOutput,
	DownloadDataOutput,
	DownloadDataWithPathOutput,
	RemoveOutput,
	RemoveWithPathOutput,
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
} from './types/outputs';

export { DEFAULT_PART_SIZE } from './utils/constants';
